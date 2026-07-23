import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@mg-nx-forge/mg-ui-shadcn-4';
import type { Table } from '@tanstack/react-table';

interface TableToolbarProps<TData> {
    table: Table<TData>;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    groupBy?: string;
    onGroupByChange?: (value: string) => void;
    groupOptions?: { value: string; label: string }[];
}

export function TableToolbar<TData>({
    table,
    globalFilter,
    setGlobalFilter,
    groupBy,
    onGroupByChange,
    groupOptions,
}: TableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0 || globalFilter !== '';

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search all columns..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {groupOptions && groupOptions.length > 0 && onGroupByChange && (
                    <div className="flex items-center gap-1.5">
                        <span className="shrink-0">Group:</span>
                        <Select value={groupBy ?? 'none'} onValueChange={(v) => onGroupByChange(v)}>
                            <SelectTrigger className="h-7 w-[120px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {groupOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <span>{table.getFilteredSelectedRowModel().rows.length} selected</span>
                )}
                <span>{table.getFilteredRowModel().rows.length} rows</span>
                {isFiltered && (
                    <button
                        type="button"
                        className="underline"
                        onClick={() => {
                            table.resetColumnFilters();
                            setGlobalFilter('');
                        }}
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
