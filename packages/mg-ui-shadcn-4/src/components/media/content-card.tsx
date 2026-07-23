import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { MediaImage } from './image';

export interface ContentCardProps {
    title: string;
    description?: string;
    imageSrc?: string | null;
    metadata?: ReactNode;
    badges?: Array<{ label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }>;
    onClick?: () => void;
    href?: string;
    className?: string;
}

export function ContentCard({
    title,
    description,
    imageSrc,
    metadata,
    badges,
    onClick,
    href,
    className,
}: ContentCardProps) {
    const Component = href ? 'a' : 'button';
    const extraProps = href ? { href } : { type: 'button' as const, onClick };

    return (
        <Component
            {...extraProps}
            className={cn(
                'group flex w-full flex-col gap-2 rounded-none border p-0 text-left transition-colors hover:bg-accent cursor-pointer',
                className
            )}
        >
            <MediaImage src={imageSrc} alt={title} />
            <div className="flex flex-col gap-1 px-3 pb-3">
                <span className="text-sm font-medium leading-tight group-hover:underline">{title}</span>
                {description && <span className="text-xs text-muted-foreground line-clamp-2">{description}</span>}
                {badges && badges.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        {badges.map((badge, i) => (
                            <Badge key={i} variant={badge.variant ?? 'outline'} className="text-[10px]">
                                {badge.label}
                            </Badge>
                        ))}
                    </div>
                )}
                {metadata && <div className="mt-1">{metadata}</div>}
            </div>
        </Component>
    );
}
