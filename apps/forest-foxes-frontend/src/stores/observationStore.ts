import { create } from 'zustand';
import { api } from '../services/api.js';
import type {
    CreateObservationPayload,
    Observation,
    PaginatedResponse,
    StatsResponse,
    TopSuspiciousItem,
} from '../types/index.js';

export interface EventFlash {
    locationId: number;
    suspicionLevel: number;
    id: string;
}

interface ObservationState {
    observations: Observation[];
    pending: Observation[];
    processed: Observation[];
    total: number;
    stats: StatsResponse | null;
    topSuspicious: TopSuspiciousItem[];
    eventFlashes: EventFlash[];
    loading: boolean;
    error: string | null;

    fetchAll: (params?: Record<string, string | number | undefined>) => Promise<void>;
    fetchPending: () => Promise<void>;
    fetchProcessed: () => Promise<void>;
    fetchStats: (tab?: string) => Promise<void>;
    fetchTopSuspicious: (limit?: number, status?: string, tab?: string) => Promise<void>;
    createObservation: (data: CreateObservationPayload) => Promise<void>;
    updateObservation: (id: string, data: Partial<CreateObservationPayload>) => Promise<void>;
    processObservation: (id: string) => Promise<void>;
    deleteObservation: (id: string) => Promise<void>;
    importObservations: (events: CreateObservationPayload[]) => Promise<{ created: number; skipped: number }>;
    addPending: (obs: Observation) => void;
    addObservation: (obs: Observation) => void;
    moveToProcessed: (obs: Observation) => void;
    updateInPlace: (obs: Observation) => void;
    removeFromStore: (id: string) => void;
    addFlash: (locationId: number, suspicionLevel: number) => void;
    removeFlash: (flashId: string) => void;
}

export const useObservationStore = create<ObservationState>((set) => ({
    observations: [],
    pending: [],
    processed: [],
    total: 0,
    stats: null,
    topSuspicious: [],
    eventFlashes: [],
    loading: false,
    error: null,

    fetchAll: async (params) => {
        set({ loading: true, error: null });
        try {
            const search = new URLSearchParams();
            if (params) {
                for (const [key, value] of Object.entries(params)) {
                    if (value !== undefined) {
                        search.set(key, String(value));
                    }
                }
            }
            const qs = search.toString();
            const res = await api.get<PaginatedResponse<Observation>>(`/api/observations${qs ? `?${qs}` : ''}`);
            set({ observations: res.data, total: res.total, loading: false });
        } catch (e) {
            set({ loading: false, error: String(e) });
        }
    },

    fetchPending: async () => {
        try {
            const res = await api.get<PaginatedResponse<Observation>>('/api/observations?status=pending&limit=100');
            set({ pending: res.data });
        } catch (e) {
            console.error('[store] fetchPending failed:', e);
        }
    },

    fetchProcessed: async () => {
        try {
            const res = await api.get<PaginatedResponse<Observation>>('/api/observations?status=processed&limit=100');
            set({ processed: res.data });
        } catch (e) {
            console.error('[store] fetchProcessed failed:', e);
        }
    },

    fetchStats: async (tab) => {
        try {
            const qs = tab ? `?tab=${tab}` : '';
            const res = await api.get<StatsResponse>(`/api/observations/stats${qs}`);
            set({ stats: res });
        } catch (e) {
            console.error('[store] fetchStats failed:', e);
        }
    },

    fetchTopSuspicious: async (limit, status, tab) => {
        try {
            const params = new URLSearchParams();
            if (limit) {
                params.set('limit', String(limit));
            }
            if (status) {
                params.set('status', status);
            }
            if (tab) {
                params.set('tab', tab);
            }
            const qs = params.toString();
            const res = await api.get<TopSuspiciousItem[]>(`/api/observations/top-suspicious${qs ? `?${qs}` : ''}`);
            set({ topSuspicious: res });
        } catch (e) {
            console.error('[store] fetchTopSuspicious failed:', e);
        }
    },

    createObservation: async (data) => {
        await api.post('/api/observations', data);
    },

    updateObservation: async (id, data) => {
        await api.patch(`/api/observations/${id}`, data);
    },

    processObservation: async (id) => {
        await api.patch(`/api/observations/${id}/process`, {});
    },

    deleteObservation: async (id) => {
        await api.del(`/api/observations/${id}`);
    },

    importObservations: async (events) => {
        const res = await api.post<{ created: number; skipped: number }>('/api/observations/import', events);
        return res;
    },

    addPending: (obs) =>
        set((state) => ({
            pending: [obs, ...state.pending],
        })),

    addObservation: (obs) =>
        set((state) => ({
            observations: [obs, ...state.observations],
        })),

    moveToProcessed: (obs) =>
        set((state) => ({
            pending: state.pending.filter((o) => o.id !== obs.id),
            processed: [obs, ...state.processed],
        })),

    updateInPlace: (obs) =>
        set((state) => ({
            observations: state.observations.map((o) => (o.id === obs.id ? obs : o)),
            pending: state.pending.map((o) => (o.id === obs.id ? obs : o)),
            processed: state.processed.map((o) => (o.id === obs.id ? obs : o)),
        })),

    removeFromStore: (id) =>
        set((state) => ({
            observations: state.observations.filter((o) => o.id !== id),
            pending: state.pending.filter((o) => o.id !== id),
            processed: state.processed.filter((o) => o.id !== id),
        })),

    addFlash: (locationId, suspicionLevel) => {
        const flash: EventFlash = { locationId, suspicionLevel, id: `flash_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
        set((state) => ({ eventFlashes: [...state.eventFlashes, flash] }));
        setTimeout(() => {
            useObservationStore.getState().removeFlash(flash.id);
        }, 2000);
    },

    removeFlash: (flashId) =>
        set((state) => ({ eventFlashes: state.eventFlashes.filter((f) => f.id !== flashId) })),
}));
