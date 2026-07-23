import { create } from 'zustand';
import type { Observation } from '../types/index.js';

interface ViewModeState {
    selectedEvent: Observation | null;
    activeCell: number | null;
    setSelectedEvent: (event: Observation | null) => void;
    setActiveCell: (id: number | null) => void;
}

export const useViewModeStore = create<ViewModeState>((set) => ({
    selectedEvent: null,
    activeCell: null,
    setSelectedEvent: (event) => set({ selectedEvent: event }),
    setActiveCell: (id) => set({ activeCell: id }),
}));
