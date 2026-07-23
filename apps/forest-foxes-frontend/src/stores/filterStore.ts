import { create } from 'zustand';

type FilterKey = 'locationId' | 'foxId' | 'suspicionMin' | 'suspicionMax';

interface FilterState {
    locationId: number | null;
    foxId: string | null;
    suspicionMin: number | null;
    suspicionMax: number | null;
    setFilter: (key: FilterKey, value: number | string | null) => void;
    clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    locationId: null,
    foxId: null,
    suspicionMin: null,
    suspicionMax: null,
    setFilter: (key, value) => set({ [key]: value }),
    clearFilters: () => set({ locationId: null, foxId: null, suspicionMin: null, suspicionMax: null }),
}));
