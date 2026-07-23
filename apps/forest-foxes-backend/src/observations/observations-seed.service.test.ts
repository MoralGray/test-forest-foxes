import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObservationsSeedService } from './observations-seed.service.js';

function createMocks() {
    const observation = {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
    };
    const fox = {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
    };
    const location = {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
    };
    return { prisma: { observation, fox, location } };
}

describe('ObservationsSeedService', () => {
    let mocks: ReturnType<typeof createMocks>;
    let service: ObservationsSeedService;

    beforeEach(() => {
        mocks = createMocks();
        service = new ObservationsSeedService({ prisma: mocks.prisma } as any);
    });

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

    describe('seedClean', () => {
        it('deletes all data and seeds 9 locations', async () => {
            mocks.prisma.observation.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.fox.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.createMany.mockResolvedValue({ count: 9 });

            const result = await service.seedClean();

            expect(result).toEqual({ status: 'clean' });
            expect(mocks.prisma.observation.deleteMany).toHaveBeenCalled();
            expect(mocks.prisma.fox.deleteMany).toHaveBeenCalled();
            expect(mocks.prisma.location.deleteMany).toHaveBeenCalled();
            expect(mocks.prisma.location.createMany).toHaveBeenCalledWith({ data: locations });
        });
    });

    describe('seedWorking', () => {
        it('seeds clean then creates 5 foxes and 30 observations', async () => {
            mocks.prisma.observation.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.fox.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.createMany.mockResolvedValue({ count: 9 });
            mocks.prisma.fox.createMany.mockResolvedValue({ count: 5 });
            mocks.prisma.observation.createMany.mockResolvedValue({ count: 30 });

            const result = await service.seedWorking();

            expect(result.status).toBe('working');
            expect(result.observations).toBe(30);
            expect(mocks.prisma.fox.createMany).toHaveBeenCalled();
            expect(mocks.prisma.observation.createMany).toHaveBeenCalled();
            const createManyCall = mocks.prisma.observation.createMany.mock.calls[0][0];
            expect(createManyCall.data).toHaveLength(30);
        });

        it('creates observations with mixed pending/processed status', async () => {
            mocks.prisma.observation.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.fox.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.createMany.mockResolvedValue({ count: 9 });
            mocks.prisma.fox.createMany.mockResolvedValue({ count: 5 });
            mocks.prisma.observation.createMany.mockResolvedValue({ count: 30 });

            await service.seedWorking();

            const observations = mocks.prisma.observation.createMany.mock.calls[0][0].data;
            const statuses = observations.map((o: any) => o.status);
            expect(statuses).toContain('pending');
            expect(statuses).toContain('processed');
        });
    });

    describe('seedCrashTest', () => {
        it('seeds clean then creates 50 foxes and 10,000 observations', async () => {
            mocks.prisma.observation.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.fox.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.createMany.mockResolvedValue({ count: 9 });
            mocks.prisma.fox.createMany.mockResolvedValue({ count: 50 });
            mocks.prisma.observation.createMany.mockResolvedValue({ count: 500 });

            const result = await service.seedCrashTest();

            expect(result.status).toBe('crash-test');
            expect(result.observations).toBe(10_000);
            expect(mocks.prisma.fox.createMany).toHaveBeenCalled();
            const foxCall = mocks.prisma.fox.createMany.mock.calls[0][0];
            expect(foxCall.data).toHaveLength(50);
        });

        it('creates observations in batches of 500', async () => {
            mocks.prisma.observation.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.fox.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.deleteMany.mockResolvedValue({ count: 0 });
            mocks.prisma.location.createMany.mockResolvedValue({ count: 9 });
            mocks.prisma.fox.createMany.mockResolvedValue({ count: 50 });
            mocks.prisma.observation.createMany.mockResolvedValue({ count: 500 });

            await service.seedCrashTest();

            expect(mocks.prisma.observation.createMany).toHaveBeenCalledTimes(20);
            mocks.prisma.observation.createMany.mock.calls.forEach((call: any) => {
                expect(call[0].data).toHaveLength(500);
            });
        });
    });
});
