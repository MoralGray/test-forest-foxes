import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useObservationStore } from '../../stores/observationStore.js';
import { useTabStore } from '../../stores/tabStore.js';
import { EventsTable } from './EventsTable.js';
import type { Observation } from '../../types/index.js';

function makeObservation(overrides: Partial<Observation> = {}): Observation {
    return {
        id: 'obs_001',
        foxId: 'fox_001',
        locationId: 1,
        hasPrey: true,
        suspicionLevel: 8,
        time: '08:20',
        status: 'pending',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        fox: { id: 'fox_001', color: 'рыжая', createdAt: '2025-01-01T00:00:00Z' },
        location: { id: 1, name: 'Северная поляна', gridRow: 1, gridCol: 1, createdAt: '2025-01-01T00:00:00Z' },
        ...overrides,
    };
}

describe('EventsTable', () => {
    beforeEach(() => {
        useObservationStore.setState({
            observations: [],
            processed: [],
            total: 0,
            stats: null,
            topSuspicious: [],
            loading: false,
            error: null,
            pending: [],
        });
        useTabStore.setState({ activeTab: 'all' });
    });

    it('renders without crash with empty data', () => {
        const { container } = render(<EventsTable />);
        expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders column headers', () => {
        render(<EventsTable />);
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Fox')).toBeInTheDocument();
        expect(screen.getByText('Location')).toBeInTheDocument();
        expect(screen.getByText('Time')).toBeInTheDocument();
        expect(screen.getByText('Suspicion')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders observation rows from store', () => {
        const obs = makeObservation({ id: 'obs_001', suspicionLevel: 7, time: '12:00' });
        useObservationStore.setState({ observations: [obs] });
        render(<EventsTable />);
        expect(screen.getByText('obs_001')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('12:00')).toBeInTheDocument();
    });

    it('shows checkmark for hasPrey when true', () => {
        const obs = makeObservation({ id: 'obs_001', status: 'processed', hasPrey: true });
        useObservationStore.setState({ observations: [obs] });
        render(<EventsTable />);
        const checkmarks = screen.getAllByText('✓');
        expect(checkmarks.length).toBe(2);
    });

    it('renders content when no matching data for processed tab', () => {
        useTabStore.setState({ activeTab: 'processed' });
        useObservationStore.setState({ observations: [], processed: [] });
        const { container } = render(<EventsTable />);
        expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('updates when observations are added to store after render', async () => {
        await act(async () => {
            render(<EventsTable />);
        });
        expect(screen.queryByText('obs_002')).not.toBeInTheDocument();

        const obs = makeObservation({ id: 'obs_002', suspicionLevel: 5, time: '14:00' });
        await act(async () => {
            useObservationStore.getState().addObservation(obs);
        });

        expect(screen.getByText('obs_002')).toBeInTheDocument();
        expect(screen.getByText('14:00')).toBeInTheDocument();
    });

    it('updates when observations are updated via updateInPlace', async () => {
        const obs = makeObservation({ id: 'obs_001', suspicionLevel: 3 });
        useObservationStore.setState({ observations: [obs] });
        await act(async () => {
            render(<EventsTable />);
        });

        const updated = { ...obs, suspicionLevel: 9 };
        await act(async () => {
            useObservationStore.getState().updateInPlace(updated);
        });

        expect(screen.getByText('9')).toBeInTheDocument();
    });
});
