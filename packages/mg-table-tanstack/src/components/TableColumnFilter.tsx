import {
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@mg-nx-forge/mg-ui-shadcn-4';
import type { Column } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { cn } from '../utils';

interface TableColumnFilterProps<TData, TValue> {
    column: Column<TData, TValue>;
}

export function TableColumnFilter<TData, TValue>({ column }: TableColumnFilterProps<TData, TValue>) {
    const filterType = (column.columnDef.meta as { filterType?: string })?.filterType ?? 'text';
    const filterOptions = (column.columnDef.meta as { filterOptions?: { value: string; label: string }[] })
        ?.filterOptions;
    const filterValue = column.getFilterValue();

    const isFiltered = filterValue !== undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="ml-1 inline-flex items-center justify-center rounded p-0.5 opacity-0 transition-opacity group-hover/header:opacity-100 hover:bg-muted aria-expanded:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Filter className={cn('size-3', isFiltered ? 'text-primary' : 'text-muted-foreground')} />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="bottom" className="w-48 p-2">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                        {(column.columnDef.header as string) || column.id}
                    </p>
                    {filterType === 'select' && filterOptions ? (
                        <Select
                            value={(filterValue as string) ?? ''}
                            onValueChange={(val) => column.setFilterValue(val || undefined)}
                        >
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                {filterOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            placeholder="Filter..."
                            value={(filterValue as string) ?? ''}
                            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
                            className="h-7 text-xs"
                        />
                    )}
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="xs"
                            className="w-full text-xs"
                            onClick={() => column.setFilterValue(undefined)}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
