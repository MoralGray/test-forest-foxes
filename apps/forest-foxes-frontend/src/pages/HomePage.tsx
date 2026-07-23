import { Card, CardContent, Tabs, TabsList, TabsTrigger } from '@mg-nx-forge/mg-ui-shadcn-4';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { DonutChart } from '../components/analytics/DonutChart.js';
import { FactorImpactTable } from '../components/analytics/FactorImpactTable.js';
import { SummaryCard } from '../components/analytics/SummaryCard.js';
import { TopFiveTable } from '../components/analytics/TopFiveTable.js';
import { EventDetailModal } from '../components/events/EventDetailModal.js';
import { EventInbox } from '../components/events/EventInbox.js';
import { EventsTable } from '../components/events/EventsTable.js';
import { ProcessedEvents } from '../components/events/ProcessedEvents.js';
import { ForestMap } from '../components/forest/ForestMap.js';
import { useSseStream } from '../hooks/useSseStream.js';
import { useFilterStore } from '../stores/filterStore.js';
import { useObservationStore } from '../stores/observationStore.js';
import { useTabStore } from '../stores/tabStore.js';

const COLOR_PALETTE = ['#d97706', '#1f2937', '#9ca3af', '#eab308', '#dc2626', '#2563eb', '#16a34a', '#9333ea', '#0891b2'];
const BUCKET_COLORS: Record<string, string> = { low: '#16a34a', medium: '#eab308', high: '#dc2626' };

export function HomePage() {
    const { stats, topSuspicious, fetchStats, fetchTopSuspicious, fetchAll, fetchPending, fetchProcessed, error } = useObservationStore();
    const { activeTab, setTab } = useTabStore();
    const { clearFilters } = useFilterStore();

    useSseStream();

    useEffect(() => {
        fetchAll();
        fetchPending();
        fetchProcessed();
    }, [fetchAll, fetchPending, fetchProcessed]);

    useEffect(() => {
        fetchStats(activeTab === 'all' ? undefined : activeTab);
        fetchTopSuspicious(5, 'processed', activeTab === 'all' ? undefined : activeTab);
    }, [activeTab, fetchStats, fetchTopSuspicious]);

    const handleTabChange = (tab: string) => {
        setTab(tab as 'all' | 'suspicious' | 'processed');
        clearFilters();
    };

    const colorDonut = (stats?.byColor ?? []).map((c, i) => ({
        name: c.color,
        value: c.count,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
        avgSuspicion: c.avgSuspicion,
    }));

    const locationDonut = (stats?.byLocation ?? []).map((l, i) => ({
        name: l.name,
        value: l.count,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
        avgSuspicion: l.avgSuspicion,
    }));

    const preyDonut = (stats?.byHasPrey ?? []).map((p) => ({
        name: p.hasPrey ? 'С добычей' : 'Без добычи',
        value: p.count,
        color: p.hasPrey ? '#d97706' : '#9ca3af',
        avgSuspicion: p.avgSuspicion,
    }));

    const suspicionDonut = (stats?.suspicionBuckets ?? []).map((b) => ({
        name: { low: 'Низкая 1-3', medium: 'Средняя 4-7', high: 'Высокая 8-10' }[b.label] ?? b.label,
        value: b.count,
        color: BUCKET_COLORS[b.label] ?? '#888',
    }));

    const tabValues = [
        { value: 'all', label: 'Все события' },
        { value: 'suspicious', label: 'Самые подозрительные' },
        { value: 'processed', label: 'Обработанные' },
    ];

    return (
        <div className="p-4 space-y-6">
            <Toaster position="top-right" />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button type="button" className="text-red-500 hover:text-red-700 font-bold ml-2" onClick={() => {}}>
                        ×
                    </button>
                </div>
            )}

            {/* Upper Section — no tabs, always all events */}
            <div className="grid grid-cols-[300px_1fr_300px] gap-4">
                <EventInbox />
                <ForestMap />
                <ProcessedEvents />
            </div>

            {/* Lower Section — with tabs */}
            <div>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="mb-4">
                        {tabValues.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <div className="grid grid-cols-[300px_1fr_300px] gap-4">
                    <Card>
                        <CardContent className="p-3 space-y-4">
                            <DonutChart data={colorDonut} title="По цвету" />
                            <DonutChart data={locationDonut} title="По локации" />
                            <DonutChart data={preyDonut} title="Has prey" />
                            <SummaryCard stats={stats} topFox={topSuspicious[0] ?? null} />
                        </CardContent>
                    </Card>
                    <div className="border rounded overflow-x-auto">
                        <EventsTable />
                    </div>
                    <Card>
                        <CardContent className="p-3 space-y-4">
                            <DonutChart data={suspicionDonut} title="Уровень подозрительности" />
                            <TopFiveTable data={topSuspicious} />
                            <FactorImpactTable stats={stats} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <EventDetailModal />
        </div>
    );
}
