import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SseService } from './sse.service.js';
import type { CreateObservationDto } from './dto/create-observation.dto.js';
import type { UpdateObservationDto } from './dto/update-observation.dto.js';
import type { Prisma } from '@mg-nx-forge/forest-foxes-shared-prisma';

@Injectable()
export class ObservationsService {
    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(SseService) private readonly sseService: SseService
    ) {}

    /**
     * Creates a new observation. If an observation with the same ID already exists,
     * returns the existing record without emitting an SSE event.
     * Emits SSE `created` event only for genuinely new records.
     */
    async create(dto: CreateObservationDto) {
        const existing = await this.prisma.prisma.observation.findUnique({
            where: { id: dto.id },
            include: { fox: true, location: true },
        });
        if (existing) {
            return existing;
        }
        await this.ensureFoxExists(dto.foxId, dto.color);
        const observation = await this.prisma.prisma.observation.create({
            data: {
                id: dto.id,
                foxId: dto.foxId,
                locationId: dto.locationId,
                hasPrey: dto.hasPrey,
                suspicionLevel: dto.suspicionLevel,
                time: dto.time,
                status: 'pending',
            },
            include: { fox: true, location: true },
        });
        this.sseService.emit({ type: 'created', data: observation as unknown as Record<string, unknown> });
        return observation;
    }

    /**
     * Lists observations with pagination, filtering, and sorting.
     * Defaults to page 1, limit 50, sorted by createdAt descending.
     */
    async findAll(query: {
        status?: string;
        locationId?: number;
        foxId?: string;
        suspicionMin?: number;
        sort?: string;
        order?: string;
        page?: number;
        limit?: number;
    }) {
        const { status, locationId, foxId, suspicionMin, sort, order, page = 1, limit = 50 } = query;
        const where: Prisma.ObservationWhereInput = {};

        if (status) {
            where.status = status;
        }
        if (locationId) {
            where.locationId = Number(locationId);
        }
        if (foxId) {
            where.foxId = foxId;
        }
        if (suspicionMin) {
            where.suspicionLevel = { gte: Number(suspicionMin) };
        }

        const orderBy: Record<string, string> = {};
        if (sort) {
            orderBy[sort] = order ?? 'asc';
        }

        const currentPage = Math.max(1, Number(page));
        const skip = (currentPage - 1) * Number(limit);

        const [data, total] = await Promise.all([
            this.prisma.prisma.observation.findMany({
                where,
                orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
                skip,
                take: Number(limit),
                include: { fox: true, location: true },
            }),
            this.prisma.prisma.observation.count({ where }),
        ]);

        return { data, total, page: currentPage, limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
    }

    /**
     * Finds an observation by ID. Includes fox and location relations.
     * @throws {NotFoundException} if the observation does not exist
     */
    async findOne(id: string) {
        const observation = await this.prisma.prisma.observation.findUnique({
            where: { id },
            include: { fox: true, location: true },
        });
        if (!observation) {
            throw new NotFoundException(`Observation ${id} not found`);
        }
        return observation;
    }

    /**
     * Updates an observation. Emits SSE `updated` event.
     * @throws {NotFoundException} if the observation or referenced fox does not exist
     */
    async update(id: string, dto: UpdateObservationDto) {
        await this.findOne(id);
        if (dto.foxId && dto.color) {
            await this.ensureFoxExists(dto.foxId, dto.color);
        } else if (dto.foxId) {
            const existing = await this.prisma.prisma.fox.findUnique({ where: { id: dto.foxId } });
            if (!existing) {
                throw new NotFoundException(`Fox ${dto.foxId} not found`);
            }
        }
        const { color: _color, ...observationData } = dto;
        const observation = await this.prisma.prisma.observation.update({
            where: { id },
            data: observationData,
            include: { fox: true, location: true },
        });
        this.sseService.emit({ type: 'updated', data: observation as unknown as Record<string, unknown> });
        return observation;
    }

    /**
     * Marks an observation as processed. Emits SSE `processed` event.
     * @throws {NotFoundException} if the observation does not exist
     */
    async process(id: string) {
        await this.findOne(id);
        const observation = await this.prisma.prisma.observation.update({
            where: { id },
            data: { status: 'processed' },
            include: { fox: true, location: true },
        });
        this.sseService.emit({ type: 'processed', data: observation as unknown as Record<string, unknown> });
        return observation;
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.prisma.observation.delete({ where: { id } });
        this.sseService.emit({ type: 'deleted', data: { id } });
    }

    private async ensureFoxExists(foxId: string, color: string) {
        const existing = await this.prisma.prisma.fox.findUnique({ where: { id: foxId } });
        if (!existing) {
            await this.prisma.prisma.fox.create({ data: { id: foxId, color } });
        } else if (existing.color !== color) {
            await this.prisma.prisma.fox.update({ where: { id: foxId }, data: { color } });
        }
    }
}
