import { type ReactNode, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

export interface MediaImageProps {
    src?: string | null;
    alt?: string;
    className?: string;
    fallback?: ReactNode;
    loading?: 'lazy' | 'eager';
}

export function MediaImage({ src, alt = '', className, fallback, loading = 'lazy' }: MediaImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div
                className={cn(
                    'aspect-video w-full bg-muted flex items-center justify-center text-muted-foreground text-xs',
                    className
                )}
            >
                {fallback ?? 'No image'}
            </div>
        );
    }

    return (
        <div className={cn('relative aspect-video w-full overflow-hidden bg-muted', className)}>
            {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
            <img
                src={src}
                alt={alt}
                loading={loading}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
                className={cn('h-full w-full object-cover', (isLoading || hasError) && 'invisible')}
            />
        </div>
    );
}
