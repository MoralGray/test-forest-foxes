import { describe, it, expect, vi } from 'vitest';
import { ObservationsAnalyticsService } from './observations-analytics.service.js';
import type { PrismaClient } from '@mg-nx-forge/forest-foxes-shared-prisma';

function createMockPrisma(): unknown {
    const mockObservation = {
        groupBy: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
        findFirst: vi.fn(),
    };
    const mockFox = {
        findMany: vi.fn(),
    };
    const mockLocation = {
        findUnique: vi.fn(),
        findMany: vi.fn(),
    };
    return {
        prisma: {
            observation: mockObservation,
            fox: mockFox,
            location: mockLocation,
        },
    };
}

describe('ObservationsAnalyticsService', () => {
    it('stats returns empty aggregates for empty database', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        const mockAgg = mockPrisma.prisma.observation as any;
        mockAgg.groupBy
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);
        mockAgg.count
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0);
        mockAgg.aggregate.mockResolvedValue({ _avg: { suspicionLevel: null } });
        (mockPrisma.prisma.fox as any).findMany.mockResolvedValue([]);

        const result = await service.stats();

        expect(result.total).toBe(0);
        expect(result.pending).toBe(0);
        expect(result.processed).toBe(0);
        expect(result.uniqueFoxes).toBe(0);
        expect(result.avgSuspicion).toBe(0);
        expect(result.byColor).toEqual([]);
        expect(result.byLocation).toEqual([]);
        expect(result.byHasPrey).toEqual([]);
        expect(result.suspicionBuckets).toHaveLength(3);
        expect(result.suspicionBuckets[0].label).toBe('low');
        expect(result.suspicionBuckets[1].label).toBe('medium');
        expect(result.suspicionBuckets[2].label).toBe('high');
    });

    it('stats calculates correct aggregates from grouped data', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        const mockAgg = mockPrisma.prisma.observation as any;
        mockAgg.groupBy
            .mockResolvedValueOnce([
                { foxId: 'fox_001', _count: { id: 3 }, _avg: { suspicionLevel: 7 } },
            ])
            .mockResolvedValueOnce([
                { locationId: 1, _count: { id: 3 }, _avg: { suspicionLevel: 7 } },
            ])
            .mockResolvedValueOnce([
                { hasPrey: true, _count: { id: 2 }, _avg: { suspicionLevel: 8 } },
                { hasPrey: false, _count: { id: 1 }, _avg: { suspicionLevel: 5 } },
            ]);
        mockAgg.count
            .mockResolvedValueOnce(3)
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0);
        mockAgg.aggregate.mockResolvedValue({ _avg: { suspicionLevel: 7 } });
        (mockPrisma.prisma.fox as any).findMany.mockResolvedValue([
            { id: 'fox_001', color: 'рыжая' },
        ]);
        (mockPrisma.prisma.location as any).findUnique.mockResolvedValue({ id: 1, name: 'Северная поляна' });

        const result = await service.stats();

        expect(result.total).toBe(3);
        expect(result.uniqueFoxes).toBe(1);
        expect(result.avgSuspicion).toBe(7);
        expect(result.byColor).toHaveLength(1);
        expect(result.byColor[0]).toEqual({ color: 'рыжая', count: 3, avgSuspicion: 7 });
        expect(result.byLocation).toHaveLength(1);
        expect(result.byLocation[0]).toEqual({ locationId: 1, name: 'Северная поляна', count: 3, avgSuspicion: 7 });
        expect(result.byHasPrey).toHaveLength(2);
        expect(result.byHasPrey[0]).toEqual({ hasPrey: true, count: 2, avgSuspicion: 8 });
        expect(result.suspicionBuckets[0].count).toBe(1);
        expect(result.suspicionBuckets[1].count).toBe(0);
        expect(result.suspicionBuckets[2].count).toBe(0);
    });

    it('stats filters by suspicious tab (suspicionLevel >= 7)', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        const mockAgg = mockPrisma.prisma.observation as any;
        mockAgg.groupBy
            .mockResolvedValue([])
            .mockResolvedValue([])
            .mockResolvedValue([]);
        mockAgg.count
            .mockResolvedValue(0)
            .mockResolvedValue(0)
            .mockResolvedValue(0)
            .mockResolvedValue(0)
            .mockResolvedValue(0)
            .mockResolvedValue(0);
        mockAgg.aggregate.mockResolvedValue({ _avg: { suspicionLevel: null } });
        (mockPrisma.prisma.fox as any).findMany.mockResolvedValue([]);

        await service.stats('suspicious');

        const groupByCalls = mockAgg.groupBy.mock.calls;
        groupByCalls.forEach((c: unknown[]) => {
            expect((c[0] as any).where.suspicionLevel).toEqual({ gte: 7 });
        });
    });

    it('stats filters by processed tab (status = processed)', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        const mockAgg = mockPrisma.prisma.observation as any;
        mockAgg.groupBy
            .mockResolvedValue([])
            .mockResolvedValue([])
            .mockResolvedValue([]);
        mockAgg.count
            .mockResolvedValue(0)
            .mockResolvedValue(0)
            .mockResolvedValue(0)
            .mockResolvedValue(0)
            .mockResolvedValue(0)
            .mockResolvedValue(0);
        mockAgg.aggregate.mockResolvedValue({ _avg: { suspicionLevel: null } });
        (mockPrisma.prisma.fox as any).findMany.mockResolvedValue([]);

        await service.stats('processed');

        const groupByCalls = mockAgg.groupBy.mock.calls;
        groupByCalls.forEach((c: unknown[], i: number) => {
            if (i === 1) {
                expect((c[0] as any).where.status).toBe('pending');
            } else {
                expect((c[0] as any).where.status).toBe('processed');
            }
        });
    });

    it('topSuspicious returns empty array for empty database', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        (mockPrisma.prisma.observation as any).groupBy.mockResolvedValue([]);
        (mockPrisma.prisma.fox as any).findMany.mockResolvedValue([]);

        const result = await service.topSuspicious(5);

        expect(result).toEqual([]);
    });

    it('topSuspicious returns top foxes by avg suspicion', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        (mockPrisma.prisma.observation as any).groupBy.mockResolvedValue([
            { foxId: 'fox_001', _avg: { suspicionLevel: 9.2 }, _count: { id: 5 }, _max: { time: '12:00' }, _min: { time: '08:00' } },
            { foxId: 'fox_002', _avg: { suspicionLevel: 7.5 }, _count: { id: 3 }, _max: { time: '11:00' }, _min: { time: '09:00' } },
        ]);
        (mockPrisma.prisma.fox as any).findMany.mockResolvedValue([
            { id: 'fox_001', color: 'рыжая' },
            { id: 'fox_002', color: 'черная' },
        ]);
        (mockPrisma.prisma.observation as any).findFirst
            .mockResolvedValueOnce({ location: { name: 'Северная поляна' } })
            .mockResolvedValueOnce({ location: { name: 'Туманная тропа' } });

        const result = await service.topSuspicious(5);

        expect(result).toHaveLength(2);
        expect(result[0].foxId).toBe('fox_001');
        expect(result[0].avgSuspicion).toBe(9.2);
        expect(result[0].lastLocation).toBe('Северная поляна');
        expect(result[1].foxId).toBe('fox_002');
        expect(result[1].avgSuspicion).toBe(7.5);
        expect(result[1].lastLocation).toBe('Туманная тропа');
    });

    it('topSuspicious respects custom limit', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        (mockPrisma.prisma.observation as any).groupBy.mockResolvedValue([]);
        (mockPrisma.prisma.fox as any).findMany.mockResolvedValue([]);

        await service.topSuspicious(10);

        expect((mockPrisma.prisma.observation as any).groupBy).toHaveBeenCalledWith(
            expect.objectContaining({ take: 10 })
        );
    });

    it('topSuspicious filters by status', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        (mockPrisma.prisma.observation as any).groupBy.mockResolvedValue([]);
        (mockPrisma.prisma.fox as any).findMany.mockResolvedValue([]);

        await service.topSuspicious(5, 'processed');

        expect((mockPrisma.prisma.observation as any).groupBy).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ status: 'processed' }),
            })
        );
    });

    it('findAllLocations returns locations ordered by id', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        const locations = [
            { id: 1, name: 'Северная поляна' },
            { id: 2, name: 'Туманная тропа' },
        ];
        (mockPrisma.prisma.location as any).findMany.mockResolvedValue(locations);

        const result = await service.findAllLocations();

        expect(result).toEqual(locations);
        expect((mockPrisma.prisma.location as any).findMany).toHaveBeenCalledWith({ orderBy: { id: 'asc' } });
    });

    it('findLocation throws NotFoundException for invalid id', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        (mockPrisma.prisma.location as any).findUnique.mockResolvedValue(null);

        await expect(service.findLocation(999)).rejects.toThrow('Location 999 not found');
    });

    it('findLocation returns location with recent observations', async () => {
        const mockPrisma = createMockPrisma() as { prisma: PrismaClient };
        const service = new ObservationsAnalyticsService(mockPrisma as any);

        const location = { id: 1, name: 'Северная поляна', observations: [] };
        (mockPrisma.prisma.location as any).findUnique.mockResolvedValue(location);

        const result = await service.findLocation(1);

        expect(result).toEqual(location);
        expect((mockPrisma.prisma.location as any).findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: { observations: { include: { fox: true }, orderBy: { time: 'desc' }, take: 20 } },
        });
    });
});
