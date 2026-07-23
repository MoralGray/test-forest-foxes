import type { ReactNode } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

export interface MediaElemRelatedItem {
    key: string | number;
    content: ReactNode;
    onClick?: () => void;
}

export interface MediaElemRelatedProps {
    title: string;
    items: MediaElemRelatedItem[];
    isLoading?: boolean;
    emptyMessage?: string;
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
}

function MediaElemRelated({ title, items, isLoading, emptyMessage, search }: MediaElemRelatedProps) {
    const hasSearch = search && items.length > 0;

    return (
        <div className="border-t pt-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h4>
                {hasSearch && (
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            value={search.value}
                            onChange={(e) => search.onChange(e.target.value)}
                            placeholder={search.placeholder ?? 'Search...'}
                            className="h-7 w-40 pl-6 text-xs"
                        />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="flex cursor-pointer items-start gap-3 border p-3 transition-colors hover:bg-accent/50"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                item.onClick?.();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    item.onClick?.();
                                }
                            }}
                        >
                            {item.content}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">{emptyMessage ?? 'No related items.'}</p>
            )}
        </div>
    );
}

export interface MediaElemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    metadata?: ReactNode;
    title: string;
    description?: string;
    children?: ReactNode;
    related?: MediaElemRelatedProps;
}

export function MediaElemModal({
    open,
    onOpenChange,
    metadata,
    title,
    description,
    children,
    related,
}: MediaElemModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    {metadata && <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">{metadata}</div>}
                    <DialogTitle className="font-serif text-xl font-bold leading-tight">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
                    )}
                </DialogHeader>

                {children}

                {related && <MediaElemRelated {...related} />}
            </DialogContent>
        </Dialog>
    );
}
