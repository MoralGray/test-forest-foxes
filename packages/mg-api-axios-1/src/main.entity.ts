import type { AxiosError } from 'axios';

export interface PathOptions {
    id?: string | number | null;
    filters?: Record<string, string | number | boolean | null | undefined> | null;
    signal?: AbortSignal | null;
}

export type ErrorHandler = (error: AxiosError) => void;

export type ErrorHandlerMap = Record<string | number, ErrorHandler>;

export type ApiEndpointMethods = {
    get: <TResponse = unknown>(options?: PathOptions) => Promise<TResponse>;
    post: <TResponse = unknown, TPayload = unknown>(data: TPayload, options?: PathOptions) => Promise<TResponse>;
    put: <TResponse = unknown, TPayload = unknown>(data: TPayload, options?: PathOptions) => Promise<TResponse>;
    patch: <TResponse = unknown, TPayload = unknown>(data: TPayload, options?: PathOptions) => Promise<TResponse>;
    del: <TResponse = unknown>(options?: PathOptions) => Promise<TResponse>;
};
