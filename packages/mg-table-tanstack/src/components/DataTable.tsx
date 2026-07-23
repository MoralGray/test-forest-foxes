import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@mg-nx-forge/mg-ui-shadcn-4';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { type RefObject, useRef } from 'react';
import { cn } from '../utils';
import { ActiveFilterBadges } from './ActiveFilterBadges';
import { TableColumnFilter } from './TableColumnFilter';
import { TablePagination } from './TablePagination';
import { TableToolbar } from './TableToolbar';

interface DataTableProps<TData> {
    table: Table<TData>;
    columns: ColumnDef<TData>[];
    toolbar?: boolean;
    pagination?: boolean;
    className?: string;
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;
    virtualization?: boolean;
    virtualizedRows?: number;
    tableContainerRef?: RefObject<HTMLDivElement | null>;
    onRowClick?: (row: TData) => void;
    sortable?: boolean;
    columnFilters?: boolean;
    loading?: boolean;
    showActiveBadges?: boolean;
    groupBy?: string;
    onGroupByChange?: (value: string) => void;
    groupOptions?: { value: string; label: string }[];
}

export function DataTable<TData>({
    table,
    columns,
    toolbar = true,
    pagination = true,
    className,
    globalFilter = '',
    onGlobalFilterChange,
    onRowClick,
    virtualization = false,
    virtualizedRows = 0,
    tableContainerRef: externalRef,
    sortable = true,
    columnFilters: enableColumnFilters = false,
    loading = false,
    showActiveBadges = true,
    groupBy,
    onGroupByChange,
    groupOptions,
}: DataTableProps<TData>) {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = externalRef || internalRef;
    const rows = table.getRowModel().rows;

    const virtualizer = useVirtualizer({
        count: virtualization ? rows.length : 0,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 40,
        overscan: 10,
        enabled: virtualization,
    });

    return (
        <div className={cn('space-y-4', className)}>
            {toolbar && (
                <TableToolbar
                    table={table}
                    globalFilter={globalFilter}
                    setGlobalFilter={onGlobalFilterChange || (() => {})}
                    groupBy={groupBy}
                    onGroupByChange={onGroupByChange}
                    groupOptions={groupOptions}
                />
            )}
            {showActiveBadges && (
                <ActiveFilterBadges
                    table={table}
                    globalFilter={globalFilter}
                    onClearGlobalFilter={() => onGlobalFilterChange?.('')}
                    groupBy={groupBy}
                    groupOptions={groupOptions}
                    onClearGroupBy={() => onGroupByChange?.('none')}
                />
            )}
            {loading ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading...</div>
            ) : (
                <div
                    ref={containerRef}
                    className={cn(
                        'relative overflow-auto',
                        virtualization && virtualizedRows > 0 && 'border rounded-md',
                        virtualization ? 'max-h-[600px]' : ''
                    )}
                >
                    <ShadcnTable style={{ tableLayout: 'fixed' }}>
                        <TableHeader className={virtualization ? 'sticky top-0 bg-background z-10' : ''}>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const canSort = sortable && header.column.getCanSort();
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    'group/header overflow-hidden text-ellipsis',
                                                    canSort && 'cursor-pointer select-none'
                                                )}
                                                style={{
                                                    minWidth: 120,
                                                    ...(header.column.columnDef.size
                                                        ? {
                                                              width: header.column.columnDef.size,
                                                              maxWidth: header.column.columnDef.size,
                                                          }
                                                        : {}),
                                                }}
                                                onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span className="truncate">
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                  header.column.columnDef.header,
                                                                  header.getContext()
                                                              )}
                                                    </span>
                                                    {canSort && (
                                                        <span className="shrink-0 text-muted-foreground">
                                                            {header.column.getIsSorted() === 'asc' ? (
                                                                <ArrowUp className="size-3" />
                                                            ) : header.column.getIsSorted() === 'desc' ? (
                                                                <ArrowDown className="size-3" />
                                                            ) : (
                                                                <ArrowUpDown className="size-3 opacity-0 group-hover/header:opacity-50" />
                                                            )}
                                                        </span>
                                                    )}
                                                    {enableColumnFilters && header.column.getCanFilter() && (
                                                        <TableColumnFilter column={header.column} />
                                                    )}
                                                </div>
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {virtualization && rows.length > 0 ? (
                                <>
                                    {virtualizer.getVirtualItems().map((virtualItem) => {
                                        const row = rows[virtualItem.index];
                                        if (!row) {
                                            return null;
                                        }
                                        return (
                                            <TableRow
                                                key={row.id}
                                                style={{
                                                    height: `${virtualItem.size}px`,
                                                    transform: `translateY(${virtualItem.start}px)`,
                                                }}
                                                className="absolute w-full"
                                                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        className="overflow-hidden text-ellipsis"
                                                        style={{
                                                            minWidth: 120,
                                                            ...(cell.column.columnDef.size
                                                                ? {
                                                                      width: cell.column.columnDef.size,
                                                                      maxWidth: cell.column.columnDef.size,
                                                                  }
                                                                : {}),
                                                        }}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })}
                                    <tr style={{ height: `${virtualizer.getTotalSize()}px` }} />
                                </>
                            ) : rows.length > 0 ? (
                                rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={cn(onRowClick && 'cursor-pointer')}
                                        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="overflow-hidden text-ellipsis"
                                                style={{
                                                    minWidth: 120,
                                                    ...(cell.column.columnDef.size
                                                        ? {
                                                              width: cell.column.columnDef.size,
                                                              maxWidth: cell.column.columnDef.size,
                                                          }
                                                        : {}),
                                                }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </ShadcnTable>
                </div>
            )}
            {pagination && !virtualization && <TablePagination table={table} />}
        </div>
    );
}
