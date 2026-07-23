import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet, mockPost, mockPatch, mockDel } = vi.hoisted(() => ({
    mockGet: vi.fn(),
    mockPost: vi.fn(),
    mockPatch: vi.fn(),
    mockDel: vi.fn(),
}));

vi.mock('../services/api.js', () => ({
    api: {
        get: mockGet,
        post: mockPost,
        patch: mockPatch,
        del: mockDel,
    },
}));

import { useObservationStore } from './observationStore';

function makeObservation(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'obs_001',
        foxId: 'fox_001',
        locationId: 1,
        hasPrey: true,
        suspicionLevel: 8,
        time: '08:20',
        status: 'pending' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        fox: { id: 'fox_001', color: 'рыжая', createdAt: '2024-01-01' },
        location: { id: 1, name: 'Северная поляна', gridRow: 1, gridCol: 1, createdAt: '2024-01-01' },
        ...overrides,
    };
}

describe('observationStore', () => {
    beforeEach(() => {
        useObservationStore.setState({
            observations: [],
            pending: [],
            processed: [],
            total: 0,
            stats: null,
            topSuspicious: [],
            loading: false,
            error: null,
        });
        mockGet.mockReset();
        mockPost.mockReset();
        mockPatch.mockReset();
        mockDel.mockReset();
    });

    describe('fetchAll', () => {
        it('sets loading true before fetch', async () => {
            mockGet.mockResolvedValue({ data: [], total: 0, page: 1, limit: 50, totalPages: 0 });

            const promise = useObservationStore.getState().fetchAll();
            expect(useObservationStore.getState().loading).toBe(true);
            await promise;
        });

        it('stores observations from API response', async () => {
            const obs = [makeObservation()];
            mockGet.mockResolvedValue({ data: obs, total: 1, page: 1, limit: 50, totalPages: 1 });

            await useObservationStore.getState().fetchAll();

            const state = useObservationStore.getState();
            expect(state.observations).toEqual(obs);
            expect(state.total).toBe(1);
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('sets error on failure', async () => {
            mockGet.mockRejectedValue(new Error('Network error'));

            await useObservationStore.getState().fetchAll();

            const state = useObservationStore.getState();
            expect(state.error).toContain('Network error');
            expect(state.loading).toBe(false);
        });

        it('passes query params to API', async () => {
            mockGet.mockResolvedValue({ data: [], total: 0, page: 1, limit: 50, totalPages: 0 });

            await useObservationStore.getState().fetchAll({ status: 'pending', limit: 100 });

            expect(mockGet).toHaveBeenCalledWith('/api/observations?status=pending&limit=100');
        });
    });

    describe('fetchPending', () => {
        it('stores pending observations', async () => {
            const obs = [makeObservation()];
            mockGet.mockResolvedValue({ data: obs, total: 1, page: 1, limit: 100, totalPages: 1 });

            await useObservationStore.getState().fetchPending();

            expect(useObservationStore.getState().pending).toEqual(obs);
        });

        it('calls API with status=pending and limit=100', async () => {
            mockGet.mockResolvedValue({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });

            await useObservationStore.getState().fetchPending();

            expect(mockGet).toHaveBeenCalledWith('/api/observations?status=pending&limit=100');
        });

        it('does not crash on error', async () => {
            mockGet.mockRejectedValue(new Error('fail'));
            await expect(useObservationStore.getState().fetchPending()).resolves.not.toThrow();
        });
    });

    describe('fetchProcessed', () => {
        it('stores processed observations', async () => {
            const obs = [makeObservation({ status: 'processed' })];
            mockGet.mockResolvedValue({ data: obs, total: 1, page: 1, limit: 100, totalPages: 1 });

            await useObservationStore.getState().fetchProcessed();

            expect(useObservationStore.getState().processed).toEqual(obs);
        });

        it('calls API with status=processed and limit=100', async () => {
            mockGet.mockResolvedValue({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });

            await useObservationStore.getState().fetchProcessed();

            expect(mockGet).toHaveBeenCalledWith('/api/observations?status=processed&limit=100');
        });
    });

    describe('fetchStats', () => {
        it('stores stats response', async () => {
            const stats = {
                total: 10,
                pending: 5,
                processed: 5,
                uniqueFoxes: 3,
                avgSuspicion: 5.5,
                byColor: [],
                byLocation: [],
                byHasPrey: [],
                suspicionBuckets: [],
            };
            mockGet.mockResolvedValue(stats);

            await useObservationStore.getState().fetchStats();

            expect(useObservationStore.getState().stats).toEqual(stats);
        });

        it('passes tab parameter', async () => {
            mockGet.mockResolvedValue({
                total: 0,
                pending: 0,
                processed: 0,
                uniqueFoxes: 0,
                avgSuspicion: 0,
                byColor: [],
                byLocation: [],
                byHasPrey: [],
                suspicionBuckets: [],
            });

            await useObservationStore.getState().fetchStats('suspicious');

            expect(mockGet).toHaveBeenCalledWith('/api/observations/stats?tab=suspicious');
        });

        it('omits tab parameter for all tab', async () => {
            mockGet.mockResolvedValue({
                total: 0,
                pending: 0,
                processed: 0,
                uniqueFoxes: 0,
                avgSuspicion: 0,
                byColor: [],
                byLocation: [],
                byHasPrey: [],
                suspicionBuckets: [],
            });

            await useObservationStore.getState().fetchStats();

            expect(mockGet).toHaveBeenCalledWith('/api/observations/stats');
        });
    });

    describe('fetchTopSuspicious', () => {
        it('stores topSuspicious response', async () => {
            const data = [
                {
                    foxId: 'fox_001',
                    color: 'рыжая',
                    avgSuspicion: 8.5,
                    count: 5,
                    firstSeen: '08:00',
                    lastSeen: '12:00',
                    lastLocation: 'Северная поляна',
                },
            ];
            mockGet.mockResolvedValue(data);

            await useObservationStore.getState().fetchTopSuspicious();

            expect(useObservationStore.getState().topSuspicious).toEqual(data);
        });

        it('builds query string from params', async () => {
            mockGet.mockResolvedValue([]);

            await useObservationStore.getState().fetchTopSuspicious(5, 'processed', 'suspicious');

            expect(mockGet).toHaveBeenCalledWith(
                '/api/observations/top-suspicious?limit=5&status=processed&tab=suspicious'
            );
        });
    });

    describe('createObservation', () => {
        it('POSTs to /api/observations', async () => {
            const payload = {
                id: 'obs_002',
                foxId: 'fox_002',
                locationId: 2,
                color: 'черная',
                hasPrey: false,
                suspicionLevel: 5,
                time: '09:00',
            };
            mockPost.mockResolvedValue({ id: 'obs_002' });

            await useObservationStore.getState().createObservation(payload);

            expect(mockPost).toHaveBeenCalledWith('/api/observations', payload);
        });
    });

    describe('updateObservation', () => {
        it('PATCHes to /api/observations/:id', async () => {
            mockPatch.mockResolvedValue({});
            await useObservationStore.getState().updateObservation('obs_001', { suspicionLevel: 9 });
            expect(mockPatch).toHaveBeenCalledWith('/api/observations/obs_001', { suspicionLevel: 9 });
        });
    });

    describe('processObservation', () => {
        it('PATCHes to /api/observations/:id/process', async () => {
            mockPatch.mockResolvedValue({});
            await useObservationStore.getState().processObservation('obs_001');
            expect(mockPatch).toHaveBeenCalledWith('/api/observations/obs_001/process', {});
        });
    });

    describe('deleteObservation', () => {
        it('DELETEs /api/observations/:id', async () => {
            mockDel.mockResolvedValue({});
            await useObservationStore.getState().deleteObservation('obs_001');
            expect(mockDel).toHaveBeenCalledWith('/api/observations/obs_001');
        });
    });

    describe('importObservations', () => {
        it('POSTs to /api/observations/import and returns counts', async () => {
            const events = [
                {
                    id: 'obs_001',
                    foxId: 'fox_001',
                    locationId: 1,
                    color: 'рыжая',
                    hasPrey: true,
                    suspicionLevel: 8,
                    time: '08:20',
                },
            ];
            mockPost.mockResolvedValue({ created: 1, skipped: 0 });

            const result = await useObservationStore.getState().importObservations(events);

            expect(result).toEqual({ created: 1, skipped: 0 });
            expect(mockPost).toHaveBeenCalledWith('/api/observations/import', events);
        });
    });

    describe('local mutations', () => {
        it('addPending prepends to pending array', () => {
            const obs = makeObservation({ id: 'obs_002' });
            useObservationStore.getState().addPending(obs);
            expect(useObservationStore.getState().pending[0]).toBe(obs);
        });

        it('addObservation prepends to observations array', () => {
            const obs = makeObservation({ id: 'obs_002' });
            useObservationStore.getState().addObservation(obs);
            expect(useObservationStore.getState().observations[0]).toBe(obs);
        });

        it('moveToProcessed removes from pending and prepends to processed', () => {
            const obs1 = makeObservation({ id: 'obs_001' });
            const obs2 = makeObservation({ id: 'obs_002' });
            useObservationStore.getState().addPending(obs1);
            useObservationStore.getState().addPending(obs2);

            useObservationStore.getState().moveToProcessed(obs1);

            expect(useObservationStore.getState().pending).toHaveLength(1);
            expect(useObservationStore.getState().pending[0]).toBe(obs2);
            expect(useObservationStore.getState().processed[0]).toBe(obs1);
        });

        it('updateInPlace updates observation in all three arrays', () => {
            const obs = makeObservation({ id: 'obs_001', suspicionLevel: 5 });
            useObservationStore.getState().addObservation(obs);
            useObservationStore.getState().addPending(obs);

            const updated = { ...obs, suspicionLevel: 9 };
            useObservationStore.getState().updateInPlace(updated);

            expect(useObservationStore.getState().observations[0].suspicionLevel).toBe(9);
            expect(useObservationStore.getState().pending[0].suspicionLevel).toBe(9);
        });

        it('removeFromStore removes from all three arrays', () => {
            const obs = makeObservation({ id: 'obs_001' });
            useObservationStore.getState().addObservation(obs);
            useObservationStore.getState().addPending(obs);
            useObservationStore.getState().moveToProcessed(obs);

            useObservationStore.getState().removeFromStore('obs_001');

            expect(useObservationStore.getState().observations).toHaveLength(0);
            expect(useObservationStore.getState().pending).toHaveLength(0);
            expect(useObservationStore.getState().processed).toHaveLength(0);
        });
    });
});
