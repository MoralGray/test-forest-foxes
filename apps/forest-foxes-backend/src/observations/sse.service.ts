import { Injectable } from '@nestjs/common';
import { Subject, type Observable } from 'rxjs';

export type SseEvent =
    | { type: 'created'; data: Record<string, unknown> | null }
    | { type: 'processed'; data: Record<string, unknown> }
    | { type: 'updated'; data: Record<string, unknown> }
    | { type: 'deleted'; data: { id: string } };

@Injectable()
export class SseService {
    private subject = new Subject<SseEvent>();

    /**
     * Emits a new event to all connected SSE clients.
     * The Subject does not buffer — events emitted before a client connects are lost.
     */
    emit(event: SseEvent) {
        this.subject.next(event);
    }

    /**
     * Returns an Observable that SSE clients subscribe to.
     * Each subscribed client receives all future events until disconnection.
     */
    stream(): Observable<SseEvent> {
        return this.subject.asObservable();
    }
}
