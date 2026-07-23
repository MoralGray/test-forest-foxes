import { useInfiniteView } from '@mg-nx-forge/mg-infinite-view-tanstack';
import { Card, CardContent, CardHeader, CardTitle, ScrollArea } from '@mg-nx-forge/mg-ui-shadcn-4';
import { api } from '../../services/api.js';
import { useFilterStore } from '../../stores/filterStore.js';
import { useViewModeStore } from '../../stores/viewModeStore.js';
import type { Observation, PaginatedResponse } from '../../types/index.js';

export function ProcessedEvents() {
    const { setSelectedEvent } = useViewModeStore();
    const { locationId } = useFilterStore();

    const { items, isLoading, isFetchingNextPage, hasNextPage, ref } = useInfiniteView<Observation>({
        queryKey: `processed-${locationId ?? 'all'}`,
        fetchFn: (page) => {
            const params = new URLSearchParams({ status: 'processed', page: String(page), limit: '20' });
            if (locationId) {
                params.set('location_id', String(locationId));
            }
            return api.get<PaginatedResponse<Observation>>(`/api/observations?${params.toString()}`);
        },
        rootMargin: '0px 0px 200px 0px',
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Обработанные</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <div className="space-y-1.5 pr-2">
                        {isLoading && <p className="text-sm text-neutral-500 py-4 text-center">Загрузка...</p>}
                        {!isLoading && items.length === 0 && (
                            <p className="text-sm text-neutral-500 py-4 text-center">Нет обработанных</p>
                        )}
                        {items.map((obs) => (
                            <button
                                key={obs.id}
                                type="button"
                                onClick={() => setSelectedEvent(obs)}
                                className="w-full text-left p-2 border rounded text-sm bg-neutral-50 text-neutral-600 cursor-pointer hover:bg-neutral-100 transition-colors"
                            >
                                <div className="font-medium text-neutral-700">{obs.id} ✓</div>
                                <div>
                                    {obs.foxId} · {obs.location.name}
                                </div>
                                <div>
                                    suspicion: {obs.suspicionLevel} · {obs.time}
                                </div>
                            </button>
                        ))}
                        <div ref={ref} className="h-px" />
                        {isFetchingNextPage && (
                            <p className="text-sm text-neutral-400 py-2 text-center">Загрузка ещё...</p>
                        )}
                        {!hasNextPage && items.length > 0 && (
                            <p className="text-xs text-neutral-400 py-2 text-center">Все события загружены</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
