import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useObservationStore } from '../../stores/observationStore.js';
import { useFilterStore } from '../../stores/filterStore.js';
import { ForestMap } from './ForestMap.js';

describe('ForestMap', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useObservationStore.setState({
            observations: [],
            pending: [],
            processed: [],
            total: 0,
            stats: null,
            topSuspicious: [],
            eventFlashes: [],
            loading: false,
            error: null,
        });
        useFilterStore.setState({
            locationId: null,
            foxId: null,
            suspicionMin: null,
            suspicionMax: null,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders 9 grid cells', () => {
        const { container } = render(<ForestMap />);
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(9);
    });

    it('shows flash overlay when eventFlash exists for a location', () => {
        useObservationStore.setState({
            eventFlashes: [{ locationId: 3, suspicionLevel: 9, id: 'test-flash' }],
        });
        const { container } = render(<ForestMap />);
        const cells = container.querySelectorAll('button');
        const cell3 = cells[2];
        expect(cell3.querySelector('[class*="animate-flash"]') ?? cell3.querySelector('[style*="animation"]')).toBeTruthy();
    });

    it('removes flash overlay after flash expires', async () => {
        const { container } = render(<ForestMap />);

        await act(async () => {
            useObservationStore.getState().addFlash(5, 9);
        });

        const cells = container.querySelectorAll('button');
        const cell5 = cells[4];
        expect(cell5.querySelector('[style*="animation"]')).toBeTruthy();

        await act(async () => {
            vi.advanceTimersByTime(2000);
        });

        expect(cell5.querySelector('[style*="animation"]')).toBeFalsy();
    });

    it('does not show flash when eventFlashes is empty', () => {
        const { container } = render(<ForestMap />);
        const cells = container.querySelectorAll('button');
        cells.forEach((cell) => {
            expect(cell.querySelector('[style*="animation"]')).toBeFalsy();
        });
    });

    it('applies active ring when cell is selected', () => {
        useFilterStore.setState({ locationId: 1 });
        const { container } = render(<ForestMap />);
        const buttons = container.querySelectorAll('button');
        const firstCell = buttons[0];
        expect(firstCell.className).toContain('ring-2');
    });

    it('addFlash creates a flash that auto-removes after 2s', async () => {
        await act(async () => {
            useObservationStore.getState().addFlash(1, 3);
        });

        let flashes = useObservationStore.getState().eventFlashes;
        expect(flashes).toHaveLength(1);
        expect(flashes[0].locationId).toBe(1);
        expect(flashes[0].suspicionLevel).toBe(3);

        await act(async () => {
            vi.advanceTimersByTime(2000);
        });

        flashes = useObservationStore.getState().eventFlashes;
        expect(flashes).toHaveLength(0);
    });
});
