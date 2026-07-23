import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from './filterStore';

describe('filterStore', () => {
    beforeEach(() => {
        useFilterStore.setState({ locationId: null, foxId: null, suspicionMin: null, suspicionMax: null });
    });

    it('initializes with null filters', () => {
        const state = useFilterStore.getState();
        expect(state.locationId).toBeNull();
        expect(state.foxId).toBeNull();
        expect(state.suspicionMin).toBeNull();
        expect(state.suspicionMax).toBeNull();
    });

    it('setFilter updates locationId', () => {
        useFilterStore.getState().setFilter('locationId', 3);
        expect(useFilterStore.getState().locationId).toBe(3);
    });

    it('setFilter updates foxId', () => {
        useFilterStore.getState().setFilter('foxId', 'fox_001');
        expect(useFilterStore.getState().foxId).toBe('fox_001');
    });

    it('setFilter updates suspicionMin', () => {
        useFilterStore.getState().setFilter('suspicionMin', 5);
        expect(useFilterStore.getState().suspicionMin).toBe(5);
    });

    it('setFilter clears a filter with null', () => {
        useFilterStore.getState().setFilter('locationId', 3);
        useFilterStore.getState().setFilter('locationId', null);
        expect(useFilterStore.getState().locationId).toBeNull();
    });

    it('clearFilters resets all to null', () => {
        useFilterStore.getState().setFilter('locationId', 3);
        useFilterStore.getState().setFilter('foxId', 'fox_001');
        useFilterStore.getState().setFilter('suspicionMin', 5);
        useFilterStore.getState().setFilter('suspicionMax', 10);
        useFilterStore.getState().clearFilters();
        const state = useFilterStore.getState();
        expect(state.locationId).toBeNull();
        expect(state.foxId).toBeNull();
        expect(state.suspicionMin).toBeNull();
        expect(state.suspicionMax).toBeNull();
    });
});
