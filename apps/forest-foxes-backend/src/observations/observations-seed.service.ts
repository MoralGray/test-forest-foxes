import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ObservationsSeedService {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    async seedClean() {
        await this.prisma.prisma.observation.deleteMany();
        await this.prisma.prisma.fox.deleteMany();
        await this.prisma.prisma.location.deleteMany();
        await this.seedLocations();
        return { status: 'clean' };
    }

    async seedWorking() {
        await this.seedClean();
        const foxes = [
            { id: 'fox_001', color: 'рыжая' },
            { id: 'fox_002', color: 'черная' },
            { id: 'fox_003', color: 'серебристая' },
            { id: 'fox_004', color: 'рыжая' },
            { id: 'fox_005', color: 'золотистая' },
        ];
        await this.prisma.prisma.fox.createMany({ data: foxes });

        const locationIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const events = [];
        for (let i = 1; i <= 30; i++) {
            const fox = foxes[Math.floor(Math.random() * foxes.length)];
            events.push({
                id: `obs_${String(i).padStart(3, '0')}`,
                foxId: fox.id,
                locationId: locationIds[Math.floor(Math.random() * locationIds.length)],
                hasPrey: Math.random() > 0.5,
                suspicionLevel: Math.floor(Math.random() * 10) + 1,
                time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                status: Math.random() > 0.5 ? 'pending' : 'processed',
            });
        }
        await this.prisma.prisma.observation.createMany({ data: events });
        return { status: 'working', observations: events.length };
    }

    async seedCrashTest() {
        await this.seedClean();
        const foxCount = 50;
        const foxes = [];
        const colors = ['рыжая', 'черная', 'серебристая', 'золотистая'];
        for (let i = 1; i <= foxCount; i++) {
            foxes.push({
                id: `fox_${String(i).padStart(3, '0')}`,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        await this.prisma.prisma.fox.createMany({ data: foxes });

        const batchSize = 500;
        const totalEvents = 10_000;
        for (let batch = 0; batch < totalEvents / batchSize; batch++) {
            const events = [];
            for (let i = 0; i < batchSize; i++) {
                const idx = batch * batchSize + i;
                const fox = foxes[Math.floor(Math.random() * foxes.length)];
                events.push({
                    id: `obs_${String(idx + 1).padStart(5, '0')}`,
                    foxId: fox.id,
                    locationId: Math.floor(Math.random() * 9) + 1,
                    hasPrey: Math.random() > 0.5,
                    suspicionLevel: Math.floor(Math.random() * 10) + 1,
                    time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                    status: Math.random() > 0.5 ? 'pending' : 'processed',
                });
            }
            await this.prisma.prisma.observation.createMany({ data: events });
        }
        return { status: 'crash-test', observations: totalEvents };
    }

    private async seedLocations() {
        const locations = [
            { id: 1, name: 'Северная поляна', gridRow: 1, gridCol: 1 },
            { id: 2, name: 'Туманная тропа', gridRow: 1, gridCol: 2 },
            { id: 3, name: 'Западный ручей', gridRow: 1, gridCol: 3 },
            { id: 4, name: 'Моховой овраг', gridRow: 2, gridCol: 1 },
            { id: 5, name: 'Центральная чаща', gridRow: 2, gridCol: 2 },
            { id: 6, name: 'Восточный склон', gridRow: 2, gridCol: 3 },
            { id: 7, name: 'Южное болото', gridRow: 3, gridCol: 1 },
            { id: 8, name: 'Старая берлога', gridRow: 3, gridCol: 2 },
            { id: 9, name: 'Лисья нора', gridRow: 3, gridCol: 3 },
        ];
        await this.prisma.prisma.location.createMany({ data: locations });
    }
}
