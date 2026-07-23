import { Card, CardContent, CardHeader, CardTitle } from '@mg-nx-forge/mg-ui-shadcn-4';
import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useFilterStore } from '../../stores/filterStore.js';
import { useObservationStore } from '../../stores/observationStore.js';
import type { Location } from '../../types/index.js';

const BORDER_COLORS: Record<string, string> = {
    green: 'border-green-400',
    'yellow-green': 'border-lime-400',
    amber: 'border-amber-400',
    orange: 'border-orange-400',
    red: 'border-red-400',
};

function getBorderColor(avgSuspicion: number | undefined): string {
    if (avgSuspicion === undefined || avgSuspicion === 0) {
        return 'border-neutral-200';
    }
    if (avgSuspicion <= 2) {
        return BORDER_COLORS.green;
    }
    if (avgSuspicion <= 4) {
        return BORDER_COLORS['yellow-green'];
    }
    if (avgSuspicion <= 6) {
        return BORDER_COLORS.amber;
    }
    if (avgSuspicion <= 8) {
        return BORDER_COLORS.orange;
    }
    return BORDER_COLORS.red;
}

export function ForestMap() {
    const [locations, setLocations] = useState<Location[]>([]);
    const { locationId, setFilter, clearFilters } = useFilterStore();
    const eventFlashes = useObservationStore((s) => s.eventFlashes);
    const stats = useObservationStore((s) => s.stats);

    useEffect(() => {
        api.get<Location[]>('/api/locations')
            .then(setLocations)
            .catch((e) => console.error('[ForestMap] failed to load locations:', e));
    }, []);

    const locationAvgMap = new Map<number, { avgSuspicion: number; count: number }>();
    if (stats) {
        for (const loc of stats.byLocation) {
            locationAvgMap.set(loc.locationId, { avgSuspicion: loc.avgSuspicion, count: loc.count });
        }
    }

    const grid = Array.from({ length: 9 }, (_, i) => {
        const loc = locations.find((l) => l.id === i + 1);
        return loc ?? { id: i + 1, name: '', gridRow: Math.floor(i / 3) + 1, gridCol: (i % 3) + 1, createdAt: '' };
    });

    const handleCellClick = (id: number) => {
        if (locationId === id) {
            clearFilters();
        } else {
            setFilter('locationId', id);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Карта леса</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-1.5 aspect-square max-w-sm mx-auto">
                    {grid.map((loc) => {
                        const isActive = locationId === loc.id;
                        const flash = eventFlashes.find((f) => f.locationId === loc.id);
                        const cellStats = locationAvgMap.get(loc.id);
                        const borderColor = getBorderColor(cellStats?.avgSuspicion);

                        return (
                            <button
                                key={loc.id}
                                type="button"
                                onClick={() => handleCellClick(loc.id)}
                                className={`
                                    border-2 rounded flex flex-col items-center justify-center text-xs
                                    transition-all duration-300 cursor-pointer relative overflow-hidden
                                    ${borderColor}
                                    ${isActive ? 'ring-2 ring-neutral-800 bg-neutral-100 scale-[1.02]' : 'bg-white hover:bg-neutral-50'}
                                `}
                            >
                                {flash && (
                                    <span
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            backgroundColor: 'transparent',
                                            animation: 'flash 2s ease-out forwards',
                                        }}
                                    />
                                )}
                                {cellStats && cellStats.avgSuspicion > 0 && (
                                    <span className="absolute top-0.5 right-1 text-[10px] font-bold leading-none opacity-40">
                                        {cellStats.avgSuspicion.toFixed(1)}
                                    </span>
                                )}
                                <span className="font-bold text-base text-neutral-400 relative z-10">{loc.id}</span>
                                {loc.name && (
                                    <span className="text-neutral-500 mt-0.5 px-1 leading-tight text-center relative z-10">
                                        {loc.name}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
