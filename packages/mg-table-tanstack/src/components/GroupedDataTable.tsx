import { Badge } from '@mg-nx-forge/mg-ui-shadcn-4';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { useDataTable } from '../hooks/useDataTable';
import { cn } from '../utils';
import { DataTable } from './DataTable';

export interface EntryGroup<TData> {
    key: string;
    label: string;
    entries: TData[];
    meta?: Record<string, string | number>;
}

interface GroupedDataTableProps<TData> {
    groups: EntryGroup<TData>[];
    columns: ColumnDef<TData>[];
    collapsedGroups: Set<string>;
    onToggleGroup: (key: string) => void;
    onRowClick?: (row: TData) => void;
    pageSize?: number;
}

function GroupTable<TData>({
    entries,
    columns,
    onRowClick,
    pageSize = 10,
}: {
    entries: TData[];
    columns: ColumnDef<TData>[];
    onRowClick?: (row: TData) => void;
    pageSize?: number;
}) {
    const { table } = useDataTable({
        columns,
        data: entries,
        pageSize,
        enablePagination: true,
        enableFilters: false,
        enableSorting: true,
    });

    return <DataTable table={table} columns={columns} toolbar={false} pagination onRowClick={onRowClick} />;
}

export function GroupedDataTable<TData>({
    groups,
    columns,
    collapsedGroups,
    onToggleGroup,
    onRowClick,
    pageSize = 10,
}: GroupedDataTableProps<TData>) {
    return (
        <div className="space-y-1">
            {groups.map((group) => {
                const isCollapsed = collapsedGroups.has(group.key);
                return (
                    <div key={group.key} className="overflow-hidden">
                        <button
                            type="button"
                            onClick={() => onToggleGroup(group.key)}
                            className="flex w-full items-center gap-2 border-b bg-muted/30 px-4 py-2 text-left text-sm font-semibold hover:bg-muted/50 transition-colors"
                        >
                            <span className="shrink-0 text-muted-foreground transition-transform duration-200">
                                <ChevronRight
                                    className={cn(
                                        'size-4 transition-transform duration-200',
                                        !isCollapsed && 'rotate-90'
                                    )}
                                />
                            </span>
                            <span>{group.label}</span>
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {group.entries.length}
                            </Badge>
                            {group.meta && Object.keys(group.meta).length > 0 && (
                                <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
                                    {Object.entries(group.meta)
                                        .map(([key, val]) => `${key}: ${val}`)
                                        .join(' · ')}
                                </span>
                            )}
                        </button>
                        <div
                            className={cn(
                                'transition-all duration-200 ease-in-out overflow-hidden',
                                isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[9999px] opacity-100'
                            )}
                        >
                            <GroupTable
                                entries={group.entries}
                                columns={columns}
                                onRowClick={onRowClick}
                                pageSize={pageSize}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
