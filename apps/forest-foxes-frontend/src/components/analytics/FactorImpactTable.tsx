import { Card, CardContent, CardHeader, CardTitle } from '@mg-nx-forge/mg-ui-shadcn-4';
import type { StatsResponse } from '../../types/index.js';

interface FactorImpactTableProps {
    stats: StatsResponse | null;
}

function Bar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-neutral-100 rounded h-3">
            <div className="bg-neutral-600 rounded h-3 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
    );
}

export function FactorImpactTable({ stats }: FactorImpactTableProps) {
    if (!stats || stats.byHasPrey.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Влияние признаков</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-500">Нет данных</CardContent>
            </Card>
        );
    }

    const preyEntries = stats.byHasPrey.map((p) => ({
        label: p.hasPrey ? 'С добычей' : 'Без добычи',
        avgSuspicion: p.avgSuspicion,
        count: p.count,
    }));

    const colorEntries = stats.byColor.map((c) => ({
        label: c.color,
        avgSuspicion: c.avgSuspicion,
        count: c.count,
    }));

    const allEntries = [...preyEntries, ...colorEntries];
    const maxSuspicion = Math.max(...allEntries.map((e) => e.avgSuspicion), 1);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Влияние признаков</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {allEntries.map((entry) => (
                    <div key={entry.label}>
                        <div className="flex justify-between mb-0.5">
                            <span className="text-neutral-600">{entry.label}</span>
                            <span className="font-medium">
                                {entry.avgSuspicion.toFixed(1)} ({entry.count})
                            </span>
                        </div>
                        <Bar value={entry.avgSuspicion} max={maxSuspicion} />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
