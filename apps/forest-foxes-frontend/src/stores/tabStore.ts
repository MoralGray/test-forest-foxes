import { create } from 'zustand';
import type { TabValue } from '../types/index.js';

interface TabState {
    activeTab: TabValue;
    setTab: (tab: TabValue) => void;
    resetTab: () => void;
}

export const useTabStore = create<TabState>((set) => ({
    activeTab: 'all',
    setTab: (tab) => set({ activeTab: tab }),
    resetTab: () => set({ activeTab: 'all' }),
}));
