import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@mg-nx-forge/mg-ui-shadcn-4';
import type { TopSuspiciousItem } from '../../types/index.js';

interface TopFiveTableProps {
    data: TopSuspiciousItem[];
}

export function TopFiveTable({ data }: TopFiveTableProps) {
    return (
        <Card>
            <CardHeader><CardTitle>Top 5 подозрительных</CardTitle></CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <p className="text-sm text-neutral-500">Нет данных</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Fox</TableHead>
                                <TableHead>Avg Susp</TableHead>
                                <TableHead>Obs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, i) => (
                                <TableRow key={item.foxId}>
                                    <TableCell className="font-medium">
                                        {i === 0 ? (
                                            <Badge variant="default">1</Badge>
                                        ) : (
                                            i + 1
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div>{item.foxId}</div>
                                        <div className="text-xs text-neutral-500">{item.color}</div>
                                    </TableCell>
                                    <TableCell>{item.avgSuspicion}</TableCell>
                                    <TableCell>{item.count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
