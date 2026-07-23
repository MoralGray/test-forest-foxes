import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    type SortingState,
    type Table,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import { useCallback, useState } from 'react';

export interface UseDataTableOptions<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    pageSize?: number;
    enableSorting?: boolean;
    enableFilters?: boolean;
    enablePagination?: boolean;
    enableVirtualization?: boolean;
    enableRowSelection?: boolean;
    manualPagination?: boolean;
    pageCount?: number;
    onPaginationChange?: (state: PaginationState) => void;
    initialSorting?: SortingState;
}

export interface UseDataTableReturn<TData> {
    table: Table<TData>;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    sorting: SortingState;
    setSorting: (value: SortingState | ((prev: SortingState) => SortingState)) => void;
    columnFilters: ColumnFiltersState;
    setColumnFilters: (value: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => void;
}

export function useDataTable<TData>({
    columns,
    data,
    pageSize = 10,
    enableSorting = true,
    enableFilters = true,
    enablePagination = true,
    enableVirtualization = false,
    enableRowSelection = false,
    manualPagination = false,
    pageCount,
    onPaginationChange: onExternalPaginationChange,
    initialSorting,
}: UseDataTableOptions<TData>): UseDataTableReturn<TData> {
    const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });

    const handlePaginationChange = useCallback(
        (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
            const next = typeof updater === 'function' ? updater(pagination) : updater;
            setPagination(next);
            onExternalPaginationChange?.(next);
        },
        [pagination, onExternalPaginationChange]
    );

    const table = useReactTable({
        data,
        columns,
        manualPagination,
        pageCount,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            rowSelection,
            pagination: enablePagination ? pagination : undefined,
        },
        enableRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: enablePagination ? handlePaginationChange : undefined,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: enableFilters ? getFilteredRowModel() : undefined,
        getPaginationRowModel:
            !manualPagination && enablePagination && !enableVirtualization ? getPaginationRowModel() : undefined,
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFacetedRowModel: enableFilters ? getFacetedRowModel() : undefined,
        getFacetedUniqueValues: enableFilters ? getFacetedUniqueValues() : undefined,
        autoResetPageIndex: false,
    });

    return {
        table,
        globalFilter,
        setGlobalFilter,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
    };
}
