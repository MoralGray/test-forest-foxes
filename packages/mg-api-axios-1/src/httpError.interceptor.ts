import type { AxiosError } from 'axios';
import type { ErrorHandler, ErrorHandlerMap } from './main.entity';

// # ------------------------------------------------------------------
// # default handlers
// # ------------------------------------------------------------------

export const DEFAULT_HANDLERS: ErrorHandlerMap = {
    401: (error: AxiosError) => console.warn('[API] Unauthorized (401):', error.message),
    403: (error: AxiosError) => console.warn('[API] Forbidden (403):', error.message),
    500: (error: AxiosError) => console.error('[API] Server Error (500):', error.message),
    503: (error: AxiosError) => console.warn('[API] Service Unavailable (503):', error.message),
    default: (error: AxiosError) => console.error('[API] HTTP Error:', error.message),
};

// # ------------------------------------------------------------------
// # createErrorHandlers
// # ------------------------------------------------------------------

export function createErrorHandlers(customHandlers?: ErrorHandlerMap): ErrorHandlerMap {
    const merged: ErrorHandlerMap = { ...DEFAULT_HANDLERS };
    if (customHandlers) {
        for (const [status, handler] of Object.entries(customHandlers)) {
            merged[status] = handler;
        }
    }
    return merged;
}

// # ------------------------------------------------------------------
// # getErrorHandler
// # ------------------------------------------------------------------

export function getErrorHandler(handlers: ErrorHandlerMap, status?: number): ErrorHandler {
    if (status != null && handlers[status]) {
        return handlers[status];
    }
    return handlers.default ?? DEFAULT_HANDLERS.default;
}
