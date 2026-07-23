import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SseService } from './sse.service.js';
import type { CreateObservationDto } from './dto/create-observation.dto.js';

@Injectable()
export class ObservationsImportService {
    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(SseService) private readonly sseService: SseService
    ) {}

    async importObservations(events: CreateObservationDto[]) {
        let created = 0;
        let skipped = 0;
        for (const event of events) {
            const exists = await this.prisma.prisma.observation.findUnique({ where: { id: event.id } });
            if (exists) {
                skipped++;
                continue;
            }
            await this.ensureFoxExists(event.foxId, event.color);
            await this.prisma.prisma.observation.create({
                data: {
                    id: event.id,
                    foxId: event.foxId,
                    locationId: event.locationId,
                    hasPrey: event.hasPrey,
                    suspicionLevel: event.suspicionLevel,
                    time: event.time,
                    status: 'pending',
                },
            });
            created++;
        }
        this.sseService.emit({ type: 'created', data: null });
        return { created, skipped };
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
