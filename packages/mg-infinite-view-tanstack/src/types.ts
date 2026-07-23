export interface PaginatedResult<T> {
    data: T[];
    page: number;
    totalPages: number;
}

export interface UseInfiniteViewOptions<T> {
    queryKey: string;
    fetchFn: (page: number) => Promise<PaginatedResult<T>>;
    limit?: number;
    rootMargin?: string;
    threshold?: number;
    enabled?: boolean;
    staleTime?: number;
}

export interface UseInfiniteViewResult<T> {
    items: T[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    isError: boolean;
    error: Error | null;
    fetchNextPage: () => void;
    refetch: () => void;
    ref: (node: Element | null) => void;
}
