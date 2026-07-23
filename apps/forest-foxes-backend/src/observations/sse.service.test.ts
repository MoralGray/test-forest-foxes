import { describe, it, expect } from 'vitest';
import { SseService } from './sse.service.js';

describe('SseService', () => {
    it('emits event and stream receives it', () =>
        new Promise<void>((done) => {
            const service = new SseService();
            const event = { type: 'created' as const, data: { id: 'obs_001' } };

            service.stream().subscribe((received) => {
                expect(received).toEqual(event);
                done();
            });

            service.emit(event);
        }));

    it('supports processed event type', () =>
        new Promise<void>((done) => {
            const service = new SseService();
            const event = { type: 'processed' as const, data: { id: 'obs_001' } };

            service.stream().subscribe((received) => {
                expect(received.type).toBe('processed');
                done();
            });

            service.emit(event);
        }));

    it('supports updated event type', () =>
        new Promise<void>((done) => {
            const service = new SseService();
            const event = { type: 'updated' as const, data: { id: 'obs_001' } };

            service.stream().subscribe((received) => {
                expect(received.type).toBe('updated');
                done();
            });

            service.emit(event);
        }));

    it('supports deleted event type with id only', () =>
        new Promise<void>((done) => {
            const service = new SseService();
            const event = { type: 'deleted' as const, data: { id: 'obs_001' } };

            service.stream().subscribe((received) => {
                expect(received).toEqual(event);
                done();
            });

            service.emit(event);
        }));

    it('does not replay past events to late subscribers', () =>
        new Promise<void>((done) => {
            const service = new SseService();

            service.emit({ type: 'created', data: { id: 'obs_001' } });

            const received: unknown[] = [];
            service.stream().subscribe((e) => {
                received.push(e);
            });

            service.emit({ type: 'created', data: { id: 'obs_002' } });

            setTimeout(() => {
                expect(received).toHaveLength(1);
                expect((received[0] as { data: { id: string } }).data.id).toBe('obs_002');
                done();
            }, 50);
        }));

    it('handles emit without subscribers without error', () => {
        const service = new SseService();
        expect(() => {
            service.emit({ type: 'created', data: null });
        }).not.toThrow();
    });

    it('supports data: null for created events', () =>
        new Promise<void>((done) => {
            const service = new SseService();

            service.stream().subscribe((received) => {
                expect(received).toEqual({ type: 'created', data: null });
                done();
            });

            service.emit({ type: 'created', data: null });
        }));
});
