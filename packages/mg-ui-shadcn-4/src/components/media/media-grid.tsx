import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// # ------------------------------------------------------------------
// # Types
// # ------------------------------------------------------------------

export type CellSize = 'hero' | 'feature' | 'wide' | 'standard' | 'compact';

export interface LayoutCell {
    gridColumn: string;
    gridRow: string;
    size: CellSize;
}

export interface LayoutTemplate {
    name: string;
    gridTemplateColumns: string;
    gridTemplateRows: string;
    cells: LayoutCell[];
}

export interface MediaGridItem {
    id: number;
    title: string;
    description: string;
    category: string;
    popularity: number;
    date: string;
}

export interface MediaGridSectionGroup {
    items: MediaGridItem[];
    template: LayoutTemplate;
}

// # ------------------------------------------------------------------
// # Layout Templates
// # ------------------------------------------------------------------

const featuredTemplates: LayoutTemplate[] = [
    {
        name: 'hero-left',
        gridTemplateColumns: '2fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr auto',
        cells: [
            { gridColumn: '1 / 2', gridRow: '1 / 3', size: 'hero' },
            { gridColumn: '2 / 3', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '2 / 3', size: 'compact' },
            { gridColumn: '1 / 4', gridRow: '3 / 4', size: 'wide' },
        ],
    },
    {
        name: 'hero-top',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: 'auto 1fr 1fr',
        cells: [
            { gridColumn: '1 / 4', gridRow: '1 / 2', size: 'feature' },
            { gridColumn: '1 / 2', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '2 / 3', size: 'compact' },
            { gridColumn: '1 / 2', gridRow: '3 / 4', size: 'compact' },
            { gridColumn: '2 / 4', gridRow: '3 / 4', size: 'wide' },
        ],
    },
    {
        name: 'balanced',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        cells: [
            { gridColumn: '1 / 2', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '1 / 2', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '2 / 3', size: 'compact' },
        ],
    },
];

const overflowTemplates: LayoutTemplate[] = [
    {
        name: 'overflow-balance',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        cells: [
            { gridColumn: '1 / 2', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '1 / 2', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '2 / 3', size: 'standard' },
        ],
    },
    {
        name: 'overflow-feature-left',
        gridTemplateColumns: '2fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr auto',
        cells: [
            { gridColumn: '1 / 2', gridRow: '1 / 3', size: 'feature' },
            { gridColumn: '2 / 3', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '2 / 3', size: 'compact' },
            { gridColumn: '3 / 4', gridRow: '2 / 3', size: 'compact' },
            { gridColumn: '1 / 4', gridRow: '3 / 4', size: 'wide' },
        ],
    },
    {
        name: 'overflow-feature-top',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: 'auto 1fr 1fr',
        cells: [
            { gridColumn: '1 / 4', gridRow: '1 / 2', size: 'feature' },
            { gridColumn: '1 / 2', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '2 / 3', size: 'compact' },
            { gridColumn: '3 / 4', gridRow: '2 / 3', size: 'compact' },
            { gridColumn: '1 / 2', gridRow: '3 / 4', size: 'standard' },
            { gridColumn: '2 / 4', gridRow: '3 / 4', size: 'wide' },
        ],
    },
];

// # ------------------------------------------------------------------
// # Small Group Templates (for runs with < 6 items)
// # ------------------------------------------------------------------

const smallGroupTemplates: Record<number, LayoutTemplate> = {
    1: {
        name: 'single-hero',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        cells: [{ gridColumn: '1 / 2', gridRow: '1 / 2', size: 'hero' }],
    },
    2: {
        name: 'split-50',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr',
        cells: [
            { gridColumn: '1 / 2', gridRow: '1 / 2', size: 'feature' },
            { gridColumn: '2 / 3', gridRow: '1 / 2', size: 'feature' },
        ],
    },
    3: {
        name: 'three-equal',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr',
        cells: [
            { gridColumn: '1 / 2', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '1 / 2', size: 'standard' },
        ],
    },
    4: {
        name: 'grid-2x2',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        cells: [
            { gridColumn: '1 / 2', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '1 / 2', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '2 / 3', size: 'standard' },
        ],
    },
    5: {
        name: 'three-plus-two',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        cells: [
            { gridColumn: '1 / 2', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '2 / 3', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '3 / 4', gridRow: '1 / 2', size: 'standard' },
            { gridColumn: '1 / 2', gridRow: '2 / 3', size: 'standard' },
            { gridColumn: '2 / 4', gridRow: '2 / 3', size: 'feature' },
        ],
    },
};

// # ------------------------------------------------------------------
// # Layout Engine
// # ------------------------------------------------------------------

function pickFeaturedTemplate(items: MediaGridItem[]): LayoutTemplate {
    const sorted = [...items].sort((a, b) => b.popularity - a.popularity);
    const gap0 = (sorted[0]?.popularity ?? 0) - (sorted[1]?.popularity ?? 0);
    const gap1 = (sorted[1]?.popularity ?? 0) - (sorted[2]?.popularity ?? 0);

    if (gap0 > 300 && gap0 > gap1 * 2) {
        return featuredTemplates[0] as LayoutTemplate;
    }
    if (gap0 > 150) {
        return featuredTemplates[1] as LayoutTemplate;
    }
    return featuredTemplates[2] as LayoutTemplate;
}

function pickSectionTemplate(items: MediaGridItem[], sectionIndex: number): LayoutTemplate {
    if (sectionIndex === 0) {
        return pickFeaturedTemplate(items);
    }

    const idx = (sectionIndex - 1) % overflowTemplates.length;
    return overflowTemplates[idx] as LayoutTemplate;
}

export function groupIntoSections(items: MediaGridItem[]): MediaGridSectionGroup[] {
    const sections: MediaGridSectionGroup[] = [];
    let remaining = [...items];

    let sectionIndex = 0;
    while (remaining.length > 0) {
        if (remaining.length <= 5) {
            const template = smallGroupTemplates[remaining.length] as LayoutTemplate;
            sections.push({ items: [...remaining], template });
            break;
        }
        const template = pickSectionTemplate(remaining, sectionIndex);
        const chunk = remaining.slice(0, template.cells.length);
        sections.push({ items: chunk, template });
        remaining = remaining.slice(chunk.length);
        sectionIndex++;
    }

    return sections;
}

// # ------------------------------------------------------------------
// # Components
// # ------------------------------------------------------------------

// MediaGridCard

export interface MediaGridCardProps {
    item: MediaGridItem;
    cell?: LayoutCell;
    onArticleClick?: (id: number) => void;
    renderImage?: (item: MediaGridItem) => ReactNode;
}

const sizeClasses: Record<CellSize, { title: string; padding: string; description: string; gap: string }> = {
    hero: {
        title: 'text-2xl font-bold leading-tight',
        padding: 'p-6',
        description: 'text-sm leading-relaxed line-clamp-4',
        gap: 'gap-3',
    },
    feature: {
        title: 'text-xl font-bold leading-tight',
        padding: 'p-5',
        description: 'text-sm leading-relaxed line-clamp-3',
        gap: 'gap-2',
    },
    wide: {
        title: 'text-lg font-bold leading-tight',
        padding: 'p-4',
        description: 'text-sm leading-relaxed line-clamp-2',
        gap: 'gap-2',
    },
    standard: {
        title: 'text-base font-bold leading-tight',
        padding: 'p-4',
        description: 'text-sm leading-relaxed line-clamp-2',
        gap: 'gap-2',
    },
    compact: {
        title: 'text-sm font-bold leading-tight',
        padding: 'p-3',
        description: 'text-xs leading-relaxed line-clamp-1',
        gap: 'gap-1',
    },
};

function formatDate(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function MediaGridCard({ item, cell, onArticleClick, renderImage }: MediaGridCardProps) {
    const s = sizeClasses[cell?.size ?? 'standard'];

    return (
        <article
            className={cn(
                'flex flex-col border bg-card',
                s.padding,
                s.gap,
                onArticleClick && 'cursor-pointer hover:bg-accent/50 transition-colors'
            )}
            style={{
                gridColumn: cell?.gridColumn,
                gridRow: cell?.gridRow,
            }}
            onClick={() => onArticleClick?.(item.id)}
            onKeyDown={(e) => {
                if (onArticleClick && (e.key === 'Enter' || e.key === ' ')) {
                    onArticleClick(item.id);
                }
            }}
            tabIndex={onArticleClick ? 0 : undefined}
            role={onArticleClick ? 'button' : undefined}
        >
            {renderImage && <div className="w-full overflow-hidden rounded-none">{renderImage(item)}</div>}
            <div className="flex items-start justify-between gap-2">
                <h3 className={cn('font-heading', s.title)}>{item.title}</h3>
            </div>
            <p className={s.description}>{item.description}</p>
            <div className="mt-auto flex items-center justify-between pt-2">
                <span
                    className={cn(
                        'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 opacity-50'
                    )}
                >
                    {formatDate(item.date)} | {item.popularity} | {item.category}
                </span>
            </div>
        </article>
    );
}

// MediaGridSection

export interface MediaGridSectionProps {
    items: MediaGridItem[];
    template: LayoutTemplate;
    onArticleClick?: (id: number) => void;
    gridTemplateColumnsOverride?: string;
    renderImage?: (item: MediaGridItem) => ReactNode;
}

export function MediaGridSection({
    items,
    template,
    onArticleClick,
    gridTemplateColumnsOverride,
    renderImage,
}: MediaGridSectionProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div
            className="grid gap-4"
            style={{
                gridTemplateColumns: gridTemplateColumnsOverride ?? template.gridTemplateColumns,
                gridTemplateRows: template.gridTemplateRows,
            }}
        >
            {items.map((item, i) => {
                const cell = template.cells[i] ?? (template.cells[0] as LayoutCell);
                return (
                    <MediaGridCard
                        key={item.id}
                        item={item}
                        cell={cell}
                        onArticleClick={onArticleClick}
                        renderImage={renderImage}
                    />
                );
            })}
        </div>
    );
}

// # ------------------------------------------------------------------
// # SectionSeparator
// # ------------------------------------------------------------------

function SectionSeparator({ label }: { label?: string }) {
    if (!label) {
        return <hr className="my-8 border-t" />;
    }

    return (
        <div className="relative my-8 flex items-center gap-4">
            <span className="shrink-0 font-heading text-sm uppercase tracking-widest text-muted-foreground">
                {label}
            </span>
            <hr className="flex-1 border-t" />
        </div>
    );
}

// MediaGrid

export interface MediaGridProps {
    items: MediaGridItem[];
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    sentinelRef: (node: Element | null) => void;
    sections?: MediaGridSectionGroup[];
    sectionTitles?: string[];
    onArticleClick?: (id: number) => void;
    gridTemplateColumnsOverride?: string;
    renderImage?: (item: MediaGridItem) => ReactNode;
}

export function MediaGrid({
    items,
    isFetchingNextPage,
    hasNextPage,
    sentinelRef,
    sections: propSections,
    sectionTitles,
    onArticleClick,
    gridTemplateColumnsOverride,
    renderImage,
}: MediaGridProps) {
    const sections = propSections ?? groupIntoSections(items);

    if (items.length === 0) {
        return null;
    }

    return (
        <>
            {sections.map((section, sectionIndex) => (
                <div key={`section-${section.items[0]?.id ?? sectionIndex}`}>
                    {((sectionTitles && sectionIndex === 0) || sectionIndex > 0) && (
                        <SectionSeparator label={sectionTitles?.[sectionIndex]} />
                    )}
                    <MediaGridSection
                        items={section.items}
                        template={section.template}
                        onArticleClick={onArticleClick}
                        gridTemplateColumnsOverride={gridTemplateColumnsOverride}
                        renderImage={renderImage}
                    />
                </div>
            ))}

            <div ref={sentinelRef} className="h-4" />

            {isFetchingNextPage && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}

            {!hasNextPage && items.length > 0 && (
                <footer className="mt-10 border-t pt-6 text-center">
                    <p className="font-heading text-sm italic text-muted-foreground/60">— End of feed —</p>
                </footer>
            )}
        </>
    );
}
