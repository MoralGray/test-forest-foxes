import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useObservationStore } from '../stores/observationStore.js';
import { useTabStore } from '../stores/tabStore.js';

export function useSseStream() {
    const addPending = useObservationStore((s) => s.addPending);
    const addObservation = useObservationStore((s) => s.addObservation);
    const addFlash = useObservationStore((s) => s.addFlash);
    const moveToProcessed = useObservationStore((s) => s.moveToProcessed);
    const updateInPlace = useObservationStore((s) => s.updateInPlace);
    const removeFromStore = useObservationStore((s) => s.removeFromStore);
    const fetchStats = useObservationStore((s) => s.fetchStats);
    const fetchTopSuspicious = useObservationStore((s) => s.fetchTopSuspicious);
    const fetchAll = useObservationStore((s) => s.fetchAll);
    const fetchPending = useObservationStore((s) => s.fetchPending);
    const fetchProcessed = useObservationStore((s) => s.fetchProcessed);
    const activeTab = useTabStore((s) => s.activeTab);
    const queryClient = useQueryClient();

    useEffect(() => {
        const es = new EventSource('/api/observations/stream');

        const refreshAnalytics = () => {
            fetchStats(activeTab === 'all' ? undefined : activeTab);
            fetchTopSuspicious(5, 'processed', activeTab === 'all' ? undefined : activeTab);
        };

        es.onmessage = (msg) => {
            try {
                const { type, data } = JSON.parse(msg.data);
                switch (type) {
                    case 'created':
                        if (data) {
                            addFlash(data.locationId, data.suspicionLevel);
                            addPending(data);
                            addObservation(data);
                        } else {
                            fetchAll();
                            fetchPending();
                            fetchProcessed();
                        }
                        refreshAnalytics();
                        break;
                    case 'processed':
                        moveToProcessed(data);
                        updateInPlace(data);
                        refreshAnalytics();
                        break;
                    case 'updated':
                        updateInPlace(data);
                        refreshAnalytics();
                        break;
                    case 'deleted':
                        removeFromStore(data.id);
                        refreshAnalytics();
                        break;
                }
                queryClient.invalidateQueries({
                    predicate: (q) =>
                        typeof q.queryKey[0] === 'string' &&
                        (q.queryKey[0].startsWith('pending-') || q.queryKey[0].startsWith('processed-')),
                });
            } catch (e) {
                console.error('[sse] malformed event:', e);
            }
        };

        return () => es.close();
    }, [
        addPending,
        addObservation,
        addFlash,
        moveToProcessed,
        updateInPlace,
        removeFromStore,
        fetchStats,
        fetchTopSuspicious,
        fetchAll,
        fetchPending,
        fetchProcessed,
        activeTab,
        queryClient,
    ]);
}
