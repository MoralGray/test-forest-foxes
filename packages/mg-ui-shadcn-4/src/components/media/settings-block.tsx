// # ==========================================================================
// # Settings — Shared Entity Settings Tab + Account Tab
// # ==========================================================================

import { ExternalLink, Info, LogOut, Search, SlidersHorizontal, User } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ComboboxField, Form, RadioField } from '../form';
import { PLFullBlock } from '../PageLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { TypographyH3, TypographyMuted } from '../ui/typography';

// # ------------------------------------------------------------------
// # SettingsCard
// # ------------------------------------------------------------------

export interface SettingsCardProps {
    title: string;
    description?: string;
    isSelected: boolean;
    onToggle: () => void;
    badge?: {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        label: string;
    };
    metadata?: React.ReactNode;
    showInfo?: boolean;
    infoTooltip?: string;
    onInfo?: () => void;
    showExternalLink?: boolean;
    externalLinkTooltip?: string;
    externalUrl?: string;
}

export function SettingsCard({
    title,
    description,
    isSelected,
    onToggle,
    badge,
    metadata,
    showInfo,
    infoTooltip,
    onInfo,
    showExternalLink,
    externalLinkTooltip,
    externalUrl,
}: SettingsCardProps) {
    return (
        <div className="flex gap-1 items-stretch">
            <Card
                className={`min-w-0 flex-1 cursor-pointer select-none transition-opacity ${
                    isSelected ? '' : 'opacity-50'
                }`}
                onClick={onToggle}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="truncate text-sm">{title}</CardTitle>
                            {badge && (
                                <Badge variant={badge.variant} className="h-4 px-1 py-0 text-[10px]">
                                    {badge.label}
                                </Badge>
                            )}
                        </div>
                        {description && <CardDescription className="text-[10px]">{description}</CardDescription>}
                        {metadata && <div className="mt-1">{metadata}</div>}
                    </div>
                    <Switch checked={isSelected} size="sm" className="pointer-events-none" />
                </CardHeader>
            </Card>
            {(showInfo || showExternalLink) && (
                <div className="flex flex-col gap-1">
                    {showInfo && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="xs" variant="outline" className="flex-1" onClick={() => onInfo?.()}>
                                    <Info className="size-3" />
                                    Info
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">{infoTooltip ?? 'Info'}</TooltipContent>
                        </Tooltip>
                    )}
                    {showExternalLink && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        if (externalUrl) {
                                            window.open(externalUrl, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                >
                                    <ExternalLink className="size-3" />
                                    Site
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">{externalLinkTooltip ?? 'Visit website'}</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            )}
        </div>
    );
}

// # ------------------------------------------------------------------
// # Types
// # ------------------------------------------------------------------

interface FilterFormData {
    groupBy: string[];
    sortOption: string;
    filterValues: string[];
}

interface FilterState {
    groupBy: string[];
    sort: string;
    filterValues: string[];
    isApplied: boolean;
}

export interface EntitySettingsTabProps<TEntity> {
    fetchEntities: () => Promise<TEntity[]>;
    getEntityId: (entity: TEntity) => string;
    selectedIds: string[];
    toggleEntity: (id: string) => void;
    setSelectedIds: (ids: string[]) => void;
    description: string;
    searchPlaceholder: string;
    emptyMessage: string;
    errorMessage: string;
    loadingMessage: string;
    searchFn: (entity: TEntity, query: string) => boolean;
    sortOptions: Array<{ value: string; label: string }>;
    sortFn: (entities: TEntity[], sort: string) => TEntity[];
    defaultSort: string;
    groupOptions: Array<{ value: string; label: string }>;
    groupKeyFn: (entity: TEntity, dimension: string) => string;
    groupLabelFn: (dimension: string) => string;
    defaultGroupBy: string[];
    initialFilterApplied?: boolean;
    showFilterPanel?: boolean;
    filterFieldLabel: string;
    filterPlaceholder: string;
    filterOptions: Array<{ value: string; label: string }>;
    filterPredicate: (entity: TEntity, values: string[]) => boolean;
    renderCard: (entity: TEntity, isSelected: boolean, onToggle: () => void) => ReactNode;
}

// # ------------------------------------------------------------------
// # FilterControls
// # ------------------------------------------------------------------

interface FilterControlsProps {
    onApply: (data: FilterFormData) => void;
    onClear: () => void;
    defaultValues: FilterFormData;
    groupOptions: Array<{ value: string; label: string }>;
    sortOptions: Array<{ value: string; label: string }>;
    filterOptions: Array<{ value: string; label: string }>;
    filterFieldLabel: string;
    filterPlaceholder: string;
}

function FilterControls({
    onApply,
    onClear,
    defaultValues,
    groupOptions,
    sortOptions,
    filterOptions,
    filterFieldLabel,
    filterPlaceholder,
}: FilterControlsProps) {
    return (
        <div className="border bg-card p-4">
            <Form<FilterFormData> onSubmit={onApply} defaultValues={defaultValues}>
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <h3 className="mb-2 text-sm font-semibold">Group</h3>
                        <ComboboxField
                            name="groupBy"
                            label="Group by"
                            options={groupOptions}
                            placeholder="Select dimensions..."
                        />
                    </div>
                    <div>
                        <h3 className="mb-2 text-sm font-semibold">Filter</h3>
                        <ComboboxField
                            name="filterValues"
                            label={filterFieldLabel}
                            options={filterOptions}
                            placeholder={filterPlaceholder}
                        />
                    </div>
                    <div>
                        <h3 className="mb-2 text-sm font-semibold">Sort</h3>
                        <RadioField name="sortOption" options={sortOptions} />
                    </div>
                </div>
                <div className="mt-6 flex justify-center gap-2">
                    <Button type="submit" size="xs">
                        Apply
                    </Button>
                    <Button type="button" variant="outline" size="xs" onClick={onClear}>
                        Clear
                    </Button>
                </div>
            </Form>
        </div>
    );
}

// # ------------------------------------------------------------------
// # EntitySettingsTab
// # ------------------------------------------------------------------

export function EntitySettingsTab<TEntity>({
    fetchEntities,
    getEntityId,
    selectedIds,
    toggleEntity,
    setSelectedIds,
    description,
    searchPlaceholder,
    emptyMessage,
    errorMessage,
    loadingMessage,
    searchFn,
    sortOptions,
    sortFn,
    defaultSort,
    groupOptions,
    groupKeyFn,
    groupLabelFn,
    defaultGroupBy,
    initialFilterApplied = true,
    showFilterPanel = true,
    filterFieldLabel,
    filterPlaceholder,
    filterOptions,
    filterPredicate,
    renderCard,
}: EntitySettingsTabProps<TEntity>) {
    const [entities, setEntities] = useState<TEntity[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterState, setFilterState] = useState<FilterState>({
        groupBy: defaultGroupBy,
        sort: defaultSort,
        filterValues: [],
        isApplied: initialFilterApplied,
    });
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setIsError(false);
        fetchEntities()
            .then((data) => {
                if (!cancelled) {
                    setEntities(data);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setIsError(true);
                    setIsLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [fetchEntities]);

    const displayEntities = useMemo(() => {
        if (!entities) {
            return [];
        }
        let filtered = [...entities];

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = filtered.filter((e) => searchFn(e, q));
        }

        if (filterState.isApplied && filterState.filterValues.length > 0) {
            filtered = filtered.filter((e) => filterPredicate(e, filterState.filterValues));
        }

        return sortFn(filtered, filterState.sort);
    }, [entities, searchQuery, filterState, searchFn, filterPredicate, sortFn]);

    const totalCount = entities?.length ?? 0;
    const selectedCount = selectedIds.length;
    const displayCount = displayEntities.length;

    const handleSelectAll = useCallback(() => {
        setSelectedIds(displayEntities.map((e) => getEntityId(e)));
    }, [displayEntities, setSelectedIds, getEntityId]);

    const handleDeselectAll = useCallback(() => {
        setSelectedIds([]);
    }, [setSelectedIds]);

    const handleTogglePanel = useCallback(() => {
        setIsPanelOpen((prev) => !prev);
        setFormKey((k) => k + 1);
    }, []);

    const handleApply = useCallback((data: FilterFormData) => {
        setFilterState({
            groupBy: data.groupBy ?? [],
            sort: data.sortOption,
            filterValues: data.filterValues ?? [],
            isApplied: true,
        });
        setIsPanelOpen(false);
    }, []);

    const handleClear = useCallback(() => {
        setFilterState({
            groupBy: defaultGroupBy,
            sort: defaultSort,
            filterValues: [],
            isApplied: initialFilterApplied,
        });
        setIsPanelOpen(false);
    }, [defaultGroupBy, defaultSort, initialFilterApplied]);

    const shouldGroup = filterState.isApplied && filterState.groupBy.length > 0;

    const groupedEntities = useMemo(() => {
        if (!shouldGroup || !displayEntities) {
            return null;
        }
        const groups = new Map<string, TEntity[]>();
        for (const entity of displayEntities) {
            const key = filterState.groupBy.map((dim) => groupKeyFn(entity, dim)).join(' > ');
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(entity);
        }
        return groups;
    }, [displayEntities, shouldGroup, filterState.groupBy, groupKeyFn]);

    if (isLoading) {
        return (
            <PLFullBlock>
                <div className="flex items-center justify-center py-16">
                    <TypographyMuted>{loadingMessage}</TypographyMuted>
                </div>
            </PLFullBlock>
        );
    }

    if (isError || !entities) {
        return (
            <PLFullBlock>
                <div className="flex items-center justify-center py-16">
                    <TypographyMuted>{errorMessage}</TypographyMuted>
                </div>
            </PLFullBlock>
        );
    }

    return (
        <PLFullBlock>
            <TypographyMuted>{description}</TypographyMuted>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <TypographyMuted>
                    {selectedCount} of {totalCount} selected
                    {displayCount !== totalCount && <span> (filtered to {displayCount})</span>}
                </TypographyMuted>
                <div className="flex flex-wrap items-center gap-2">
                    <Button size="xs" variant="outline" onClick={handleSelectAll}>
                        Select All
                    </Button>
                    <Button size="xs" variant="outline" onClick={handleDeselectAll}>
                        Deselect All
                    </Button>
                    {showFilterPanel && (
                        <Button
                            size="xs"
                            variant={filterState.isApplied ? 'default' : 'outline'}
                            onClick={handleTogglePanel}
                        >
                            <SlidersHorizontal className="size-3" />
                            {filterState.isApplied ? 'Edit' : 'Filter/Group'}
                        </Button>
                    )}
                </div>
            </div>

            {showFilterPanel && filterState.isApplied && (
                <div className="flex flex-wrap items-center gap-2">
                    {filterState.groupBy.map((dim) => (
                        <Badge key={dim}>Group: {groupLabelFn(dim)}</Badge>
                    ))}
                    {filterState.sort !== defaultSort && (
                        <Badge variant="secondary">
                            Sort: {sortOptions.find((o) => o.value === filterState.sort)?.label ?? filterState.sort}
                        </Badge>
                    )}
                    {filterState.filterValues.map((val) => (
                        <Badge key={val}>Filter: {val}</Badge>
                    ))}
                </div>
            )}

            {showFilterPanel && isPanelOpen && (
                <FilterControls
                    key={`rfc-${formKey}`}
                    onApply={handleApply}
                    onClear={handleClear}
                    defaultValues={{
                        groupBy: filterState.groupBy,
                        sortOption: filterState.sort,
                        filterValues: filterState.filterValues,
                    }}
                    groupOptions={groupOptions}
                    sortOptions={sortOptions}
                    filterOptions={filterOptions}
                    filterFieldLabel={filterFieldLabel}
                    filterPlaceholder={filterPlaceholder}
                />
            )}

            {displayEntities.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <TypographyMuted>{emptyMessage}</TypographyMuted>
                </div>
            ) : shouldGroup && groupedEntities ? (
                <div className="space-y-6">
                    {Array.from(groupedEntities.entries()).map(([groupTitle, groupItems]) => (
                        <div key={groupTitle}>
                            <h3 className="mb-3 text-sm font-semibold capitalize">{groupTitle}</h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {groupItems.map((entity) => {
                                    const id = getEntityId(entity);
                                    const isSelected = selectedIds.includes(id);
                                    return renderCard(entity, isSelected, () => toggleEntity(id));
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {displayEntities.map((entity) => {
                        const id = getEntityId(entity);
                        const isSelected = selectedIds.includes(id);
                        return renderCard(entity, isSelected, () => toggleEntity(id));
                    })}
                </div>
            )}
        </PLFullBlock>
    );
}

// # ------------------------------------------------------------------
// # AccountTab
// # ------------------------------------------------------------------

export function AccountTab() {
    return (
        <PLFullBlock>
            <div className="grid gap-2">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                    <User className="size-4" />
                    Create account — unlock more
                </h3>
                <TypographyMuted>
                    Sign up to save your selections, sync data across devices, and keep your filter state and
                    preferences between sessions. Get priority support and future features like team collaboration.
                </TypographyMuted>
                <div className="pt-1">
                    <Button disabled variant="default" size="sm">
                        Create account
                    </Button>
                    <span className="ml-3 text-[11px] text-muted-foreground">Coming in epic-2</span>
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <TypographyH3 text="Profile" />
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="display-name">Display name</Label>
                        <Input id="display-name" disabled placeholder="Coming in epic-2" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" disabled placeholder="Coming in epic-2" />
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <TypographyH3 text="Session" />
                <Button variant="outline" disabled>
                    <LogOut className="size-3.5" />
                    Logout
                </Button>
                <TypographyMuted>Auth features coming in epic-2.</TypographyMuted>
            </div>
        </PLFullBlock>
    );
}
