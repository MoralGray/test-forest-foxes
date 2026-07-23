import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObservationsImportService } from './observations-import.service.js';

function createMocks() {
    const observation = {
        findUnique: vi.fn(),
        create: vi.fn(),
    };
    const fox = {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    };
    const sse = { emit: vi.fn() };
    return { prisma: { observation, fox }, sse };
}

describe('ObservationsImportService', () => {
    let mocks: ReturnType<typeof createMocks>;
    let service: ObservationsImportService;

    beforeEach(() => {
        mocks = createMocks();
        service = new ObservationsImportService({ prisma: mocks.prisma } as any, { emit: mocks.sse.emit } as any);
    });

    const event = {
        id: 'obs_001',
        foxId: 'fox_001',
        locationId: 1,
        color: 'рыжая',
        hasPrey: true,
        suspicionLevel: 8,
        time: '08:20',
    };

    it('creates new observations and returns created count', async () => {
        mocks.prisma.observation.findUnique.mockResolvedValue(null);
        mocks.prisma.fox.findUnique.mockResolvedValue({ id: 'fox_001', color: 'рыжая' });
        mocks.prisma.observation.create.mockResolvedValue({ id: 'obs_001' });

        const result = await service.importObservations([event]);

        expect(result).toEqual({ created: 1, skipped: 0 });
        expect(mocks.sse.emit).toHaveBeenCalledWith({ type: 'created', data: null });
    });

    it('skips duplicate observations', async () => {
        mocks.prisma.observation.findUnique.mockResolvedValue({ id: 'obs_001' });

        const result = await service.importObservations([event]);

        expect(result).toEqual({ created: 0, skipped: 1 });
        expect(mocks.prisma.observation.create).not.toHaveBeenCalled();
    });

    it('handles mix of new and existing observations', async () => {
        const event1 = { ...event, id: 'obs_001' };
        const event2 = { ...event, id: 'obs_002' };

        mocks.prisma.observation.findUnique.mockResolvedValueOnce({ id: 'obs_001' }).mockResolvedValueOnce(null);
        mocks.prisma.fox.findUnique.mockResolvedValue({ id: 'fox_001', color: 'рыжая' });
        mocks.prisma.observation.create.mockResolvedValue({ id: 'obs_002' });

        const result = await service.importObservations([event1, event2]);

        expect(result).toEqual({ created: 1, skipped: 1 });
    });

    it('auto-creates fox if not exists', async () => {
        mocks.prisma.observation.findUnique.mockResolvedValue(null);
        mocks.prisma.fox.findUnique.mockResolvedValue(null);
        mocks.prisma.fox.create.mockResolvedValue({ id: 'fox_001', color: 'рыжая' });
        mocks.prisma.observation.create.mockResolvedValue({ id: 'obs_001' });

        await service.importObservations([event]);

        expect(mocks.prisma.fox.create).toHaveBeenCalledWith({
            data: { id: 'fox_001', color: 'рыжая' },
        });
    });

    it('updates fox color if changed', async () => {
        mocks.prisma.observation.findUnique.mockResolvedValue(null);
        mocks.prisma.fox.findUnique.mockResolvedValue({ id: 'fox_001', color: 'черная' });
        mocks.prisma.fox.update.mockResolvedValue({ id: 'fox_001', color: 'рыжая' });
        mocks.prisma.observation.create.mockResolvedValue({ id: 'obs_001' });

        await service.importObservations([event]);

        expect(mocks.prisma.fox.update).toHaveBeenCalledWith({
            where: { id: 'fox_001' },
            data: { color: 'рыжая' },
        });
    });

    it('returns zero counts for empty array', async () => {
        const result = await service.importObservations([]);

        expect(result).toEqual({ created: 0, skipped: 0 });
    });

    it('creates multiple observations sequentially', async () => {
        const events = [
            { ...event, id: 'obs_001', foxId: 'fox_001' },
            { ...event, id: 'obs_002', foxId: 'fox_002' },
        ];

        mocks.prisma.observation.findUnique.mockResolvedValue(null);
        mocks.prisma.fox.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
        mocks.prisma.fox.create
            .mockResolvedValueOnce({ id: 'fox_001', color: 'рыжая' })
            .mockResolvedValueOnce({ id: 'fox_002', color: 'рыжая' });
        mocks.prisma.observation.create
            .mockResolvedValueOnce({ id: 'obs_001' })
            .mockResolvedValueOnce({ id: 'obs_002' });

        const result = await service.importObservations(events);

        expect(result).toEqual({ created: 2, skipped: 0 });
        expect(mocks.prisma.observation.create).toHaveBeenCalledTimes(2);
    });
});
