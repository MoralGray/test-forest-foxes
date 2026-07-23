import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('api', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('get sends GET request and returns JSON', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: 'ok' }) });
        const result = await api.get('/api/test');
        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: undefined,
        });
        expect(result).toEqual({ data: 'ok' });
    });

    it('post sends POST with JSON body', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'obs_001' }) });
        const body = { id: 'obs_001' };
        const result = await api.post('/api/observations', body);
        expect(mockFetch).toHaveBeenCalledWith('/api/observations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        expect(result).toEqual({ id: 'obs_001' });
    });

    it('patch sends PATCH with JSON body', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ status: 'processed' }) });
        const body = { status: 'processed' };
        const result = await api.patch('/api/observations/obs_001', body);
        expect(mockFetch).toHaveBeenCalledWith('/api/observations/obs_001', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        expect(result).toEqual({ status: 'processed' });
    });

    it('del sends DELETE request', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        const result = await api.del('/api/observations/obs_001');
        expect(mockFetch).toHaveBeenCalledWith('/api/observations/obs_001', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: undefined,
        });
        expect(result).toEqual({});
    });

    it('throws error with status and body text for non-ok response', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            text: () => Promise.resolve('Invalid data'),
        });
        await expect(api.get('/api/test')).rejects.toThrow('400 Bad Request: Invalid data');
    });

    it('post without body does not include body field', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        await api.post('/api/observations', undefined);
        expect(mockFetch).toHaveBeenCalledWith('/api/observations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: undefined,
        });
    });

    it('handles non-JSON error response gracefully', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: () => Promise.resolve('Server error'),
        });
        await expect(api.get('/api/test')).rejects.toThrow('500 Internal Server Error: Server error');
    });
});
