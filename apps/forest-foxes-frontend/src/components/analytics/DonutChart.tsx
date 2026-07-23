import {
    ChartContainer,
    ChartTooltip,
} from '@mg-nx-forge/mg-ui-shadcn-4';
import { PieChart, Pie, Cell } from 'recharts';

interface DonutDataItem {
    name: string;
    value: number;
    color: string;
    avgSuspicion?: number;
}

interface DonutChartProps {
    data: DonutDataItem[];
    title: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: DonutDataItem }[] }) {
    if (!active || !payload?.length) { return null; }
    const entry = payload[0].payload as DonutDataItem;

    return (
        <div className="bg-white border border-neutral-200 rounded-md shadow-sm px-3 py-2 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                />
                {entry.name}
            </div>
            <div className="text-neutral-600">
                {entry.value} событий
            </div>
            {entry.avgSuspicion !== undefined && (
                <div className="text-neutral-600">
                    средний suspicion: {entry.avgSuspicion.toFixed(1)}
                </div>
            )}
        </div>
    );
}

export function DonutChart({ data, title }: DonutChartProps) {
    const config: Record<string, { label: string; color: string }> = {};
    for (const item of data) {
        const key = item.name.replace(/\s+/g, '_').toLowerCase();
        config[key] = { label: item.name, color: item.color };
    }

    if (data.length === 0) {
        return (
            <div className="text-sm text-neutral-500 py-4 text-center">
                {title}: нет данных
            </div>
        );
    }

    return (
        <div className="border border-neutral-200 rounded p-3">
            <div className="text-xs font-medium text-neutral-600 mb-1">{title}</div>
            <ChartContainer config={config} className="max-h-[180px]">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={80}
                        stroke="none"
                    >
                        {data.map((entry) => {
                            const key = entry.name.replace(/\s+/g, '_').toLowerCase();
                            return <Cell key={entry.name} fill={`var(--color-${key})`} />;
                        })}
                    </Pie>
                    <ChartTooltip content={<CustomTooltip />} />
                </PieChart>
            </ChartContainer>
        </div>
    );
}