import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObservationsService } from './observations.service.js';

function createMockPrisma() {
    const mockObservation = {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    };
    const mockFox = {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    };
    const mockSse = {
        emit: vi.fn(),
    };
    return { prisma: { observation: mockObservation, fox: mockFox }, sse: mockSse };
}

describe('ObservationsService', () => {
    let mocks: ReturnType<typeof createMockPrisma>;
    let service: ObservationsService;

    beforeEach(() => {
        mocks = createMockPrisma();
        service = new ObservationsService({ prisma: mocks.prisma } as any, { emit: mocks.sse.emit } as any);
    });

    describe('create', () => {
        const dto = {
            id: 'obs_001',
            foxId: 'fox_001',
            locationId: 1,
            color: 'рыжая',
            hasPrey: true,
            suspicionLevel: 8,
            time: '08:20',
        };

        it('creates a new observation with pending status', async () => {
            mocks.prisma.observation.findUnique.mockResolvedValue(null);
            mocks.prisma.fox.findUnique.mockResolvedValue({ id: 'fox_001', color: 'рыжая' });
            mocks.prisma.observation.create.mockResolvedValue({
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            });

            const result = await service.create(dto);

            expect(mocks.prisma.observation.create).toHaveBeenCalledWith({
                data: {
                    id: 'obs_001',
                    foxId: 'fox_001',
                    locationId: 1,
                    hasPrey: true,
                    suspicionLevel: 8,
                    time: '08:20',
                    status: 'pending',
                },
                include: { fox: true, location: true },
            });
            expect(mocks.sse.emit).toHaveBeenCalledWith({
                type: 'created',
                data: expect.any(Object),
            });
        });

        it('returns existing observation if duplicate ID', async () => {
            const existing = {
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            };
            mocks.prisma.observation.findUnique.mockResolvedValue(existing);

            const result = await service.create(dto);

            expect(result).toBe(existing);
            expect(mocks.prisma.observation.create).not.toHaveBeenCalled();
            expect(mocks.sse.emit).not.toHaveBeenCalled();
        });

        it('auto-creates fox if not exists', async () => {
            mocks.prisma.observation.findUnique.mockResolvedValue(null);
            mocks.prisma.fox.findUnique.mockResolvedValue(null);
            mocks.prisma.fox.create.mockResolvedValue({ id: 'fox_001', color: 'рыжая' });
            mocks.prisma.observation.create.mockResolvedValue({
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            });

            await service.create(dto);

            expect(mocks.prisma.fox.create).toHaveBeenCalledWith({
                data: { id: 'fox_001', color: 'рыжая' },
            });
        });

        it('updates fox color if changed', async () => {
            mocks.prisma.observation.findUnique.mockResolvedValue(null);
            mocks.prisma.fox.findUnique.mockResolvedValue({ id: 'fox_001', color: 'черная' });
            mocks.prisma.fox.update.mockResolvedValue({ id: 'fox_001', color: 'рыжая' });
            mocks.prisma.observation.create.mockResolvedValue({
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            });

            await service.create(dto);

            expect(mocks.prisma.fox.update).toHaveBeenCalledWith({
                where: { id: 'fox_001' },
                data: { color: 'рыжая' },
            });
        });
    });

    describe('findAll', () => {
        it('returns paginated results sorted by createdAt desc', async () => {
            const observations = [{ id: 'obs_001' }];
            mocks.prisma.observation.findMany.mockResolvedValue(observations);
            mocks.prisma.observation.count.mockResolvedValue(1);

            const result = await service.findAll({});

            expect(result.data).toEqual(observations);
            expect(result.total).toBe(1);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(50);
            expect(mocks.prisma.observation.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: { createdAt: 'desc' },
                skip: 0,
                take: 50,
                include: { fox: true, location: true },
            });
        });

        it('filters by status', async () => {
            mocks.prisma.observation.findMany.mockResolvedValue([]);
            mocks.prisma.observation.count.mockResolvedValue(0);

            await service.findAll({ status: 'pending' });

            expect(mocks.prisma.observation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'pending' }),
                })
            );
        });

        it('filters by locationId', async () => {
            mocks.prisma.observation.findMany.mockResolvedValue([]);
            mocks.prisma.observation.count.mockResolvedValue(0);

            await service.findAll({ locationId: 3 });

            expect(mocks.prisma.observation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ locationId: 3 }),
                })
            );
        });

        it('filters by foxId', async () => {
            mocks.prisma.observation.findMany.mockResolvedValue([]);
            mocks.prisma.observation.count.mockResolvedValue(0);

            await service.findAll({ foxId: 'fox_001' });

            expect(mocks.prisma.observation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ foxId: 'fox_001' }),
                })
            );
        });

        it('filters by suspicionMin', async () => {
            mocks.prisma.observation.findMany.mockResolvedValue([]);
            mocks.prisma.observation.count.mockResolvedValue(0);

            await service.findAll({ suspicionMin: 5 });

            expect(mocks.prisma.observation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ suspicionLevel: { gte: 5 } }),
                })
            );
        });

        it('supports custom sort', async () => {
            mocks.prisma.observation.findMany.mockResolvedValue([]);
            mocks.prisma.observation.count.mockResolvedValue(0);

            await service.findAll({ sort: 'time', order: 'asc' });

            expect(mocks.prisma.observation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { time: 'asc' },
                })
            );
        });

        it('returns empty data for no matches', async () => {
            mocks.prisma.observation.findMany.mockResolvedValue([]);
            mocks.prisma.observation.count.mockResolvedValue(0);

            const result = await service.findAll({ status: 'pending' });

            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
        });

        it('defaults to createdAt desc when no sort param provided', async () => {
            mocks.prisma.observation.findMany.mockResolvedValue([]);
            mocks.prisma.observation.count.mockResolvedValue(0);

            await service.findAll({});

            const callArgs = mocks.prisma.observation.findMany.mock.calls[0][0];
            expect(callArgs.orderBy).toEqual({ createdAt: 'desc' });
        });

        it('uses explicit sort when sort param is provided', async () => {
            mocks.prisma.observation.findMany.mockResolvedValue([]);
            mocks.prisma.observation.count.mockResolvedValue(0);

            await service.findAll({ sort: 'time', order: 'asc' });

            const callArgs = mocks.prisma.observation.findMany.mock.calls[0][0];
            expect(callArgs.orderBy).toEqual({ time: 'asc' });
        });
    });

    describe('findOne', () => {
        it('returns observation with relations', async () => {
            const observation = {
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            };
            mocks.prisma.observation.findUnique.mockResolvedValue(observation);

            const result = await service.findOne('obs_001');

            expect(result).toBe(observation);
        });

        it('throws NotFoundException for missing observation', async () => {
            mocks.prisma.observation.findUnique.mockResolvedValue(null);

            await expect(service.findOne('obs_999')).rejects.toThrow('Observation obs_999 not found');
        });
    });

    describe('update', () => {
        it('updates fields and emits SSE', async () => {
            const existing = {
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            };
            mocks.prisma.observation.findUnique.mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
            mocks.prisma.fox.findUnique.mockResolvedValue({ id: 'fox_001', color: 'рыжая' });
            mocks.prisma.observation.update.mockResolvedValue(existing);

            const result = await service.update('obs_001', { suspicionLevel: 9 });

            expect(mocks.prisma.observation.update).toHaveBeenCalled();
            expect(mocks.sse.emit).toHaveBeenCalledWith({ type: 'updated', data: expect.any(Object) });
        });

        it('throws NotFoundException for missing observation', async () => {
            mocks.prisma.observation.findUnique.mockResolvedValue(null);

            await expect(service.update('obs_999', { suspicionLevel: 9 })).rejects.toThrow(
                'Observation obs_999 not found'
            );
        });

        it('creates fox if foxId changes to new fox', async () => {
            const existing = {
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            };
            mocks.prisma.observation.findUnique.mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
            mocks.prisma.fox.findUnique.mockResolvedValue(null);
            mocks.prisma.fox.create.mockResolvedValue({ id: 'fox_002', color: 'черная' });
            mocks.prisma.observation.update.mockResolvedValue(existing);

            await service.update('obs_001', { foxId: 'fox_002', color: 'черная' });

            expect(mocks.prisma.fox.create).toHaveBeenCalledWith({
                data: { id: 'fox_002', color: 'черная' },
            });
        });

        it('throws if foxId changes to non-existent without color', async () => {
            const existing = {
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            };
            mocks.prisma.observation.findUnique.mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
            mocks.prisma.fox.findUnique.mockResolvedValue(null);

            await expect(service.update('obs_001', { foxId: 'fox_999' })).rejects.toThrow('Fox fox_999 not found');
        });
    });

    describe('process', () => {
        it('marks observation as processed and emits SSE', async () => {
            const existing = {
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            };
            mocks.prisma.observation.findUnique.mockResolvedValue(existing);
            mocks.prisma.observation.update.mockResolvedValue(existing);

            await service.process('obs_001');

            expect(mocks.prisma.observation.update).toHaveBeenCalledWith({
                where: { id: 'obs_001' },
                data: { status: 'processed' },
                include: { fox: true, location: true },
            });
            expect(mocks.sse.emit).toHaveBeenCalledWith({ type: 'processed', data: expect.any(Object) });
        });

        it('throws NotFoundException for missing observation', async () => {
            mocks.prisma.observation.findUnique.mockResolvedValue(null);

            await expect(service.process('obs_999')).rejects.toThrow('Observation obs_999 not found');
        });
    });

    describe('remove', () => {
        it('deletes observation and emits SSE', async () => {
            const existing = {
                id: 'obs_001',
                fox: { id: 'fox_001', color: 'рыжая' },
                location: { id: 1, name: 'Северная поляна' },
            };
            mocks.prisma.observation.findUnique.mockResolvedValue(existing);
            mocks.prisma.observation.delete.mockResolvedValue(existing);

            await service.remove('obs_001');

            expect(mocks.prisma.observation.delete).toHaveBeenCalledWith({ where: { id: 'obs_001' } });
            expect(mocks.sse.emit).toHaveBeenCalledWith({ type: 'deleted', data: { id: 'obs_001' } });
        });

        it('throws NotFoundException for missing observation', async () => {
            mocks.prisma.observation.findUnique.mockResolvedValue(null);

            await expect(service.remove('obs_999')).rejects.toThrow('Observation obs_999 not found');
        });
    });
});
