import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@mg-nx-forge/forest-foxes-shared-prisma';

@Injectable()
export class ObservationsAnalyticsService {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    async stats(tab?: string) {
        const where = this.buildTabWhere(tab);

        const [
            byColor,
            byLocation,
            byPrey,
            total,
            pendingCount,
            processedCount,
            suspicionAgg,
            lowCount,
            mediumCount,
            highCount,
        ] = await Promise.all([
            this.prisma.prisma.observation.groupBy({
                by: ['foxId'],
                where,
                _count: { id: true },
                _avg: { suspicionLevel: true },
            }),
            this.prisma.prisma.observation.groupBy({
                by: ['locationId'],
                where: { ...where, status: 'pending' },
                _count: { id: true },
                _avg: { suspicionLevel: true },
            }),
            this.prisma.prisma.observation.groupBy({
                by: ['hasPrey'],
                where,
                _count: { id: true },
                _avg: { suspicionLevel: true },
            }),
            this.prisma.prisma.observation.count({ where }),
            this.prisma.prisma.observation.count({ where: { ...where, status: 'pending' } }),
            this.prisma.prisma.observation.count({ where: { ...where, status: 'processed' } }),
            this.prisma.prisma.observation.aggregate({
                where,
                _avg: { suspicionLevel: true },
            }),
            this.prisma.prisma.observation.count({ where: { ...where, suspicionLevel: { gte: 1, lte: 3 } } }),
            this.prisma.prisma.observation.count({ where: { ...where, suspicionLevel: { gte: 4, lte: 7 } } }),
            this.prisma.prisma.observation.count({ where: { ...where, suspicionLevel: { gte: 8, lte: 10 } } }),
        ]);

        const suspicionBuckets = [
            { label: 'low', min: 1, max: 3, count: lowCount },
            { label: 'medium', min: 4, max: 7, count: mediumCount },
            { label: 'high', min: 8, max: 10, count: highCount },
        ];

        const uniqueFoxes = new Set(byColor.map((r) => r.foxId)).size;
        const colorDistribution = await this.prisma.prisma.fox.findMany({
            where: { id: { in: [...new Set(byColor.map((r) => r.foxId))] } },
        });

        const foxColorMap = new Map(colorDistribution.map((f) => [f.id, f.color]));

        const colorAgg = new Map<string, { count: number; sumSuspicion: number }>();
        for (const group of byColor) {
            const color = foxColorMap.get(group.foxId) ?? 'unknown';
            const prev = colorAgg.get(color) ?? { count: 0, sumSuspicion: 0 };
            prev.count += group._count.id;
            prev.sumSuspicion += (group._avg.suspicionLevel ?? 0) * group._count.id;
            colorAgg.set(color, prev);
        }

        const colorStats = [...colorAgg.entries()].map(([color, agg]) => ({
            color,
            count: agg.count,
            avgSuspicion: agg.count > 0 ? Number((agg.sumSuspicion / agg.count).toFixed(1)) : 0,
        }));

        const locationStats = await Promise.all(
            byLocation.map(async (g) => {
                const loc = await this.prisma.prisma.location.findUnique({ where: { id: g.locationId } });
                return {
                    locationId: g.locationId,
                    name: loc?.name ?? 'Unknown',
                    count: g._count.id,
                    avgSuspicion: g._avg.suspicionLevel ?? 0,
                };
            })
        );

        const preyStats = byPrey.map((g) => ({
            hasPrey: g.hasPrey,
            count: g._count.id,
            avgSuspicion: g._avg.suspicionLevel ?? 0,
        }));

        return {
            total,
            pending: pendingCount,
            processed: processedCount,
            uniqueFoxes,
            avgSuspicion: suspicionAgg._avg.suspicionLevel ?? 0,
            byColor: colorStats,
            byLocation: locationStats,
            byHasPrey: preyStats,
            suspicionBuckets,
        };
    }

    async topSuspicious(limit = 5, status?: string, tab?: string) {
        const where = this.buildTabWhere(tab);
        if (status) {
            where.status = status;
        }

        const groups = await this.prisma.prisma.observation.groupBy({
            by: ['foxId'],
            where,
            _avg: { suspicionLevel: true },
            _count: { id: true },
            _max: { time: true },
            _min: { time: true },
            orderBy: { _avg: { suspicionLevel: 'desc' } },
            take: Number(limit),
        });

        const foxes = await this.prisma.prisma.fox.findMany({
            where: { id: { in: groups.map((g) => g.foxId) } },
        });

        const foxMap = new Map(foxes.map((f) => [f.id, f.color]));

        const result = await Promise.all(
            groups.map(async (g) => {
                const lastObs = await this.prisma.prisma.observation.findFirst({
                    where: { foxId: g.foxId, ...(status ? { status } : {}) },
                    orderBy: { time: 'desc' },
                    include: { location: true },
                });
                return {
                    foxId: g.foxId,
                    color: foxMap.get(g.foxId) ?? 'unknown',
                    avgSuspicion: Number(g._avg.suspicionLevel?.toFixed(1)),
                    count: g._count.id,
                    firstSeen: g._min.time,
                    lastSeen: g._max.time,
                    lastLocation: lastObs?.location.name ?? null,
                };
            })
        );

        return result;
    }

    async findAllLocations() {
        return this.prisma.prisma.location.findMany({ orderBy: { id: 'asc' } });
    }

    async findLocation(id: number) {
        const location = await this.prisma.prisma.location.findUnique({
            where: { id },
            include: { observations: { include: { fox: true }, orderBy: { time: 'desc' }, take: 20 } },
        });
        if (!location) {
            throw new NotFoundException(`Location ${id} not found`);
        }
        return location;
    }

    private buildTabWhere(tab?: string): Prisma.ObservationWhereInput {
        const where: Prisma.ObservationWhereInput = {};
        if (tab === 'suspicious') {
            where.suspicionLevel = { gte: 7 };
        }
        if (tab === 'processed') {
            where.status = 'processed';
        }
        return where;
    }
}
