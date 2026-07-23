import { Badge } from '@mg-nx-forge/mg-ui-shadcn-4';
import type { Table } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, X } from 'lucide-react';

interface ActiveFilterBadgesProps<TData> {
    table: Table<TData>;
    globalFilter?: string;
    onClearGlobalFilter?: () => void;
    groupBy?: string;
    groupOptions?: { value: string; label: string }[];
    onClearGroupBy?: () => void;
}

export function ActiveFilterBadges<TData>({
    table,
    globalFilter,
    onClearGlobalFilter,
    groupBy,
    groupOptions,
    onClearGroupBy,
}: ActiveFilterBadgesProps<TData>) {
    const state = table.getState();
    const sorts = state.sorting;
    const filters = state.columnFilters;
    const hasActive =
        sorts.length > 0 ||
        filters.length > 0 ||
        (globalFilter ?? '') !== '' ||
        (groupBy && groupBy !== '' && groupBy !== 'none');

    if (!hasActive) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {sorts.map((sort) => {
                const col = table.getColumn(sort.id);
                const label = (col?.columnDef.header as string) || sort.id;
                return (
                    <Badge key={`sort-${sort.id}`} variant="secondary" className="gap-1 text-xs">
                        {sort.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
                        {label}
                    </Badge>
                );
            })}
            {filters.map((filter) => {
                const col = table.getColumn(filter.id);
                const label = (col?.columnDef.header as string) || filter.id;
                const val = typeof filter.value === 'string' ? filter.value : JSON.stringify(filter.value);
                return (
                    <Badge key={`filter-${filter.id}`} variant="secondary" className="gap-1 text-xs">
                        {label}: {val}
                        <button
                            type="button"
                            onClick={() => col?.setFilterValue(undefined)}
                            className="ml-0.5 hover:text-foreground"
                        >
                            <X className="size-3" />
                        </button>
                    </Badge>
                );
            })}
            {globalFilter && onClearGlobalFilter && (
                <Badge variant="secondary" className="gap-1 text-xs">
                    Search: {globalFilter}
                    <button type="button" onClick={onClearGlobalFilter} className="ml-0.5 hover:text-foreground">
                        <X className="size-3" />
                    </button>
                </Badge>
            )}
            {groupBy && groupBy !== 'none' && onClearGroupBy && (
                <Badge variant="secondary" className="gap-1 text-xs">
                    Group: {groupOptions?.find((o) => o.value === groupBy)?.label ?? groupBy}
                    <button type="button" onClick={onClearGroupBy} className="ml-0.5 hover:text-foreground">
                        <X className="size-3" />
                    </button>
                </Badge>
            )}
        </div>
    );
}
