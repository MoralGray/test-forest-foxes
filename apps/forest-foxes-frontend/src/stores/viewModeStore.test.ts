import { describe, it, expect, beforeEach } from 'vitest';
import { useViewModeStore } from './viewModeStore';

describe('viewModeStore', () => {
    beforeEach(() => {
        useViewModeStore.setState({ selectedEvent: null, activeCell: null });
    });

    it('initializes with null values', () => {
        const state = useViewModeStore.getState();
        expect(state.selectedEvent).toBeNull();
        expect(state.activeCell).toBeNull();
    });

    it('setSelectedEvent stores an event', () => {
        const event = { id: 'obs_001' } as any;
        useViewModeStore.getState().setSelectedEvent(event);
        expect(useViewModeStore.getState().selectedEvent).toBe(event);
    });

    it('setSelectedEvent clears with null', () => {
        useViewModeStore.getState().setSelectedEvent({ id: 'obs_001' } as any);
        useViewModeStore.getState().setSelectedEvent(null);
        expect(useViewModeStore.getState().selectedEvent).toBeNull();
    });

    it('setActiveCell stores a cell id', () => {
        useViewModeStore.getState().setActiveCell(5);
        expect(useViewModeStore.getState().activeCell).toBe(5);
    });

    it('setActiveCell clears with null', () => {
        useViewModeStore.getState().setActiveCell(5);
        useViewModeStore.getState().setActiveCell(null);
        expect(useViewModeStore.getState().activeCell).toBeNull();
    });

    it('multiple state updates are independent', () => {
        const event = { id: 'obs_002' } as any;
        useViewModeStore.getState().setSelectedEvent(event);
        useViewModeStore.getState().setActiveCell(3);
        const state = useViewModeStore.getState();
        expect(state.selectedEvent).toBe(event);
        expect(state.activeCell).toBe(3);
    });
});
