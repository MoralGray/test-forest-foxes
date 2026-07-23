import { Badge, Card, CardContent, CardHeader, CardTitle } from '@mg-nx-forge/mg-ui-shadcn-4';
import type { StatsResponse, TopSuspiciousItem } from '../../types/index.js';

interface SummaryCardProps {
    stats: StatsResponse | null;
    topFox: TopSuspiciousItem | null;
}

export function SummaryCard({ stats, topFox }: SummaryCardProps) {
    if (!stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Сводка</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-500">Загрузка...</CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Сводка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {topFox && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2 space-y-1">
                        <div className="flex items-center gap-1">
                            <Badge variant="default" className="text-xs">
                                #1
                            </Badge>
                            <span className="font-semibold text-amber-800">Самая подозрительная</span>
                        </div>
                        <div className="text-amber-900">
                            <span className="font-medium">{topFox.foxId}</span>
                            <span className="text-amber-700"> ({topFox.color})</span>
                        </div>
                        <div className="text-amber-700 text-xs space-y-0.5">
                            <div>Наблюдений: {topFox.count}</div>
                            <div>Средний suspicion: {topFox.avgSuspicion}</div>
                            <div>Последняя локация: {topFox.lastLocation ?? '—'}</div>
                            <div>Последний раз: {topFox.lastSeen}</div>
                        </div>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-neutral-600">Всего наблюдений</span>
                    <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-neutral-600">Уникальных лис</span>
                    <span className="font-medium">{stats.uniqueFoxes}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-neutral-600">Средний suspicion</span>
                    <span className="font-medium">{stats.avgSuspicion.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-neutral-600">Pending / Processed</span>
                    <span className="font-medium">
                        {stats.pending} / {stats.processed}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
