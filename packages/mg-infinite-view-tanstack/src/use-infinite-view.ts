import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import type { UseInfiniteViewOptions, UseInfiniteViewResult } from './types';

export function useInfiniteView<T>({
    queryKey,
    fetchFn,
    rootMargin = '0px 0px 400px 0px',
    threshold = 0,
    enabled = true,
    staleTime = 0,
}: UseInfiniteViewOptions<T>): UseInfiniteViewResult<T> {
    const { ref, inView } = useInView({ rootMargin, threshold });

    const initialRenderRef = useRef(true);
    const prevInViewRef = useRef(inView);

    const { data, isLoading, isFetchingNextPage, hasNextPage, isError, error, fetchNextPage, refetch } =
        useInfiniteQuery({
            queryKey: [queryKey],
            queryFn: ({ pageParam }) => fetchFn(pageParam as number),
            initialPageParam: 0,
            getNextPageParam: (lastPage) => {
                const next = lastPage.page + 1;
                return next < lastPage.totalPages ? next : undefined;
            },
            enabled,
            staleTime,
        });

    useEffect(() => {
        if (initialRenderRef.current) {
            initialRenderRef.current = false;
            prevInViewRef.current = inView;
            return;
        }

        if (inView && !prevInViewRef.current && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
        prevInViewRef.current = inView;
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const items = data?.pages.flatMap((page) => page.data) ?? [];

    return {
        items,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        isError,
        error: error as Error | null,
        fetchNextPage,
        refetch,
        ref,
    };
}
