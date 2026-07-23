import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, useDataTable } from '@mg-nx-forge/mg-table-tanstack';
import { Badge } from '@mg-nx-forge/mg-ui-shadcn-4';
import { useObservationStore } from '../../stores/observationStore.js';
import { useTabStore } from '../../stores/tabStore.js';
import { useViewModeStore } from '../../stores/viewModeStore.js';
import type { Observation } from '../../types/index.js';

export function EventsTable() {
    const { observations, processed } = useObservationStore();
    const { activeTab } = useTabStore();
    const { setSelectedEvent } = useViewModeStore();

    const data =
        activeTab === 'all'
            ? observations
            : activeTab === 'suspicious'
              ? observations.filter((o) => o.suspicionLevel >= 7)
              : processed;

    const columns = useMemo<ColumnDef<Observation>[]>(
        () => [
            { accessorKey: 'id', header: 'ID', size: 100, minSize: 80 },
            { accessorKey: 'foxId', header: 'Fox', size: 100, minSize: 80 },
            {
                id: 'location',
                header: 'Location',
                accessorFn: (row) => row.location.name,
                size: 130,
                minSize: 100,
            },
            {
                id: 'color',
                header: 'Color',
                accessorFn: (row) => row.fox.color,
                size: 90,
                minSize: 70,
            },
            {
                accessorKey: 'hasPrey',
                header: 'Prey',
                size: 60,
                minSize: 50,
                cell: ({ getValue }) => (getValue() ? '✓' : '—'),
            },
            {
                accessorKey: 'suspicionLevel',
                header: 'Suspicion',
                size: 90,
                minSize: 70,
                cell: ({ getValue }) => {
                    const v = getValue<number>();
                    return <Badge variant={v >= 7 ? 'default' : 'outline'}>{v}</Badge>;
                },
            },
            {
                accessorKey: 'time',
                header: 'Time',
                size: 80,
                minSize: 60,
                cell: ({ getValue }) => {
                    const v = getValue<string>();
                    return v.length > 5 ? v.slice(11, 16) : v;
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                size: 80,
                minSize: 60,
                cell: ({ getValue }) => (getValue() === 'processed' ? '✓' : '○'),
            },
        ],
        []
    );

    const { table } = useDataTable<Observation>({
        columns,
        data,
        pageSize: 10,
        enableSorting: true,
        enablePagination: true,
        enableFilters: false,
        initialSorting: [{ id: 'createdAt', desc: true }],
    });

    return (
        <DataTable
            table={table}
            columns={columns}
            onRowClick={setSelectedEvent}
            sortable
            pagination
            toolbar={false}
            showActiveBadges={false}
        />
    );
}
