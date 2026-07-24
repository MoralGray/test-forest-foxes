import { create } from 'zustand';
import { api } from '../services/api.js';

interface EngineStatus {
    enabled: boolean;
}

interface EngineState {
    enabled: boolean;
    loading: boolean;
    fetchStatus: () => Promise<void>;
    toggle: () => Promise<void>;
}

export const useEngineStore = create<EngineState>((set) => ({
    enabled: false,
    loading: false,

    fetchStatus: async () => {
        try {
            const res = await api.get<EngineStatus>('/api/engine/status');
            set({ enabled: res.enabled });
        } catch {
            console.error('[engineStore] fetchStatus failed');
        }
    },

    toggle: async () => {
        set({ loading: true });
        try {
            const res = await api.post<EngineStatus>('/api/engine/toggle');
            set({ enabled: res.enabled, loading: false });
        } catch {
            set({ loading: false });
            console.error('[engineStore] toggle failed');
        }
    },
}));
