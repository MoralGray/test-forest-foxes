import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataTable } from '@mg-nx-forge/mg-table-tanstack';
import type { SortingState, ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<{ id: string; time: string }>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'time', header: 'Time' },
];

describe('useDataTable', () => {
    it('initializes sorting from initialSorting option', () => {
        const initialSorting: SortingState = [{ id: 'time', desc: true }];
        const { result } = renderHook(() =>
            useDataTable({
                columns,
                data: [],
                initialSorting,
            })
        );
        expect(result.current.sorting).toEqual(initialSorting);
    });

    it('defaults to empty sorting when no initialSorting provided', () => {
        const { result } = renderHook(() =>
            useDataTable({
                columns,
                data: [],
            })
        );
        expect(result.current.sorting).toEqual([]);
    });

    it('accepts multiple initial sort columns', () => {
        const initialSorting: SortingState = [
            { id: 'time', desc: true },
            { id: 'id', desc: false },
        ];
        const { result } = renderHook(() =>
            useDataTable({
                columns,
                data: [],
                initialSorting,
            })
        );
        expect(result.current.sorting).toHaveLength(2);
        expect(result.current.sorting[0].id).toBe('time');
        expect(result.current.sorting[0].desc).toBe(true);
    });

    it('initialSorting does not affect column filters', () => {
        const { result } = renderHook(() =>
            useDataTable({
                columns,
                data: [],
                initialSorting: [{ id: 'time', desc: true }],
            })
        );
        expect(result.current.columnFilters).toEqual([]);
    });

    it('setSorting updates sorting state', async () => {
        const { result } = renderHook(() =>
            useDataTable({
                columns,
                data: [],
                initialSorting: [{ id: 'time', desc: true }],
            })
        );
        const newSorting: SortingState = [{ id: 'id', desc: false }];
        await act(async () => {
            result.current.setSorting(newSorting);
        });
        expect(result.current.sorting).toEqual(newSorting);
    });
});
