import {
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from '@mg-nx-forge/mg-ui-shadcn-4';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../services/api.js';
import { useObservationStore } from '../../stores/observationStore.js';
import { useTabStore } from '../../stores/tabStore.js';
import { useViewModeStore } from '../../stores/viewModeStore.js';
import type { Location } from '../../types/index.js';

export function EventDetailModal() {
    const { selectedEvent, setSelectedEvent } = useViewModeStore();
    const { updateObservation, processObservation, fetchStats, fetchTopSuspicious } = useObservationStore();
    const activeTab = useTabStore((s) => s.activeTab);
    const [locations, setLocations] = useState<Location[]>([]);
    const [foxId, setFoxId] = useState('');
    const [color, setColor] = useState('');
    const [locationId, setLocationId] = useState(1);
    const [hasPrey, setHasPrey] = useState(false);
    const [suspicionLevel, setSuspicionLevel] = useState(5);
    const [time, setTime] = useState('');

    useEffect(() => {
        api.get<Location[]>('/api/locations')
            .then(setLocations)
            .catch((e) => console.error('[EventDetailModal] failed to load locations:', e));
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            setFoxId(selectedEvent.foxId);
            setColor(selectedEvent.fox.color);
            setLocationId(selectedEvent.locationId);
            setHasPrey(selectedEvent.hasPrey);
            setSuspicionLevel(selectedEvent.suspicionLevel);
            setTime(selectedEvent.time);
        }
    }, [selectedEvent]);

    const open = !!selectedEvent;

    const handleClose = () => setSelectedEvent(null);

    const handleSave = async () => {
        if (!selectedEvent) {
            return;
        }
        try {
            await updateObservation(selectedEvent.id, { foxId, color, locationId, hasPrey, suspicionLevel, time });
            const tab = activeTab === 'all' ? undefined : activeTab;
            fetchStats(tab);
            fetchTopSuspicious(5, 'processed', tab);
            toast('Сохранено');
            handleClose();
        } catch {
            toast('Ошибка сохранения');
        }
    };

    const handleProcess = async () => {
        if (!selectedEvent) {
            return;
        }
        try {
            await processObservation(selectedEvent.id);
            const tab = activeTab === 'all' ? undefined : activeTab;
            fetchStats(tab);
            fetchTopSuspicious(5, 'processed', tab);
            toast('Отработано');
            handleClose();
        } catch {
            toast('Ошибка');
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    handleClose();
                }
            }}
        >
            <DialogContent showCloseButton className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{selectedEvent?.id ?? ''}</DialogTitle>
                    <DialogDescription>
                        <Badge variant="outline">
                            {selectedEvent?.status === 'processed' ? 'Обработано' : 'В ожидании'}
                        </Badge>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Fox ID</Label>
                            <Input value={foxId} onChange={(e) => setFoxId(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Color</Label>
                            <Input value={color} onChange={(e) => setColor(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Location</Label>
                        <Select value={String(locationId)} onValueChange={(v) => setLocationId(Number(v))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={String(loc.id)}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Has prey</Label>
                        <Switch checked={hasPrey} onCheckedChange={setHasPrey} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Suspicion</Label>
                            <Select value={String(suspicionLevel)} onValueChange={(v) => setSuspicionLevel(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 10 }, (_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Time</Label>
                            <Input value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                    </div>
                </div>

                <DialogFooter showCloseButton className="gap-2">
                    {selectedEvent?.status === 'pending' && (
                        <Button variant="default" onClick={handleProcess}>
                            Отработано
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
