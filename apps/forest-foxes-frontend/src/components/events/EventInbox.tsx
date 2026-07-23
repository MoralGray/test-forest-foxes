import { useInfiniteView } from '@mg-nx-forge/mg-infinite-view-tanstack';
import { Button, Card, CardContent, CardHeader, CardTitle, ScrollArea } from '@mg-nx-forge/mg-ui-shadcn-4';
import { toast } from 'sonner';
import { api } from '../../services/api.js';
import { useFilterStore } from '../../stores/filterStore.js';
import { useObservationStore } from '../../stores/observationStore.js';
import { useViewModeStore } from '../../stores/viewModeStore.js';
import type { Observation, PaginatedResponse } from '../../types/index.js';

export function EventInbox() {
    const { importObservations } = useObservationStore();
    const { setSelectedEvent } = useViewModeStore();
    const { locationId } = useFilterStore();

    const { items, isLoading, isFetchingNextPage, hasNextPage, ref } = useInfiniteView<Observation>({
        queryKey: `pending-${locationId ?? 'all'}`,
        fetchFn: (page) => {
            const params = new URLSearchParams({ status: 'pending', page: String(page), limit: '20' });
            if (locationId) {
                params.set('location_id', String(locationId));
            }
            return api.get<PaginatedResponse<Observation>>(`/api/observations?${params.toString()}`);
        },
        rootMargin: '0px 0px 200px 0px',
    });

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) {
                return;
            }
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (!Array.isArray(data)) {
                    throw new Error('Not an array');
                }
                const res = await importObservations(data);
                toast(`Импортировано: ${res.created}, пропущено: ${res.skipped}`);
            } catch {
                toast('Ошибка: неверный формат JSON');
            }
        };
        input.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>События</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleImport}>
                    Import JSON
                </Button>
                <ScrollArea className="h-[400px]">
                    <div className="space-y-1.5 pr-2">
                        {isLoading && <p className="text-sm text-neutral-500 py-4 text-center">Загрузка...</p>}
                        {!isLoading && items.length === 0 && (
                            <p className="text-sm text-neutral-500 py-4 text-center">Нет событий</p>
                        )}
                        {items.map((obs) => (
                            <button
                                key={obs.id}
                                type="button"
                                onClick={() => setSelectedEvent(obs)}
                                className="w-full text-left p-2 border rounded text-sm hover:bg-neutral-50 cursor-pointer transition-colors"
                            >
                                <div className="font-medium text-neutral-900">{obs.id}</div>
                                <div className="text-neutral-600">
                                    {obs.foxId} · {obs.location.name}
                                </div>
                                <div className="text-neutral-500">
                                    suspicion: {obs.suspicionLevel} · {obs.time}
                                </div>
                            </button>
                        ))}
                        {/* Sentinel for infinite scroll */}
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
