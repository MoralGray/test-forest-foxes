import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import { createErrorHandlers, getErrorHandler } from './httpError.interceptor';
import type { ApiEndpointMethods, ErrorHandler, ErrorHandlerMap, PathOptions } from './main.entity';

// # ==========================================================================
// # ApiClient
// # ==========================================================================

class ApiClient {
    public axiosInstance: AxiosInstance;
    private errorHandlers: ErrorHandlerMap;

    constructor(basePath?: string, axiosConfig?: Partial<AxiosRequestConfig>) {
        this.axiosInstance = axios.create({
            baseURL: basePath ?? 'http://localhost:3001',
            ...axiosConfig,
        });
        this.errorHandlers = createErrorHandlers();
        this.setupInterceptors();
    }

    // # ------------------------------------------------------------------
    // # createApi
    // # ------------------------------------------------------------------

    public createApi(definition: Record<string, string>) {
        const result: Record<string, ApiEndpointMethods> = {};
        for (const [key, value] of Object.entries(definition)) {
            result[key] = this.APIMethods(value);
        }
        return result;
    }

    // # ------------------------------------------------------------------
    // # createErrorHandlers
    // # ------------------------------------------------------------------

    public createErrorHandlers(customHandlers: ErrorHandlerMap): void {
        this.errorHandlers = createErrorHandlers(customHandlers);
    }

    // # ------------------------------------------------------------------
    // # onError
    // # ------------------------------------------------------------------

    public onError(status: string | number, handler: ErrorHandler): void {
        this.errorHandlers[status] = handler;
    }

    // # ------------------------------------------------------------------
    // # addRequestInterceptor
    // # ------------------------------------------------------------------

    public addRequestInterceptor(
        onFulfilled?: (
            config: InternalAxiosRequestConfig
        ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
        onRejected?: (error: AxiosError) => unknown
    ): number {
        return this.axiosInstance.interceptors.request.use(onFulfilled, onRejected);
    }

    // # ------------------------------------------------------------------
    // # addResponseInterceptor
    // # ------------------------------------------------------------------

    public addResponseInterceptor(
        onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
        onRejected?: (error: AxiosError) => unknown
    ): number {
        return this.axiosInstance.interceptors.response.use(onFulfilled, onRejected);
    }

    // # ------------------------------------------------------------------
    // # setupInterceptors
    // # ------------------------------------------------------------------

    private setupInterceptors(): void {
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => {
                const handler = getErrorHandler(this.errorHandlers, error.status);
                handler(error);
                return Promise.reject(error);
            }
        );
    }

    // # ------------------------------------------------------------------
    // # request
    // # ------------------------------------------------------------------

    private async request<TResponse = unknown, TPayload = unknown>(
        method: string,
        api: string,
        data?: TPayload,
        options?: PathOptions
    ): Promise<TResponse> {
        const url = this.getPath(api, options);
        const config: AxiosRequestConfig = {
            method,
            url,
            data,
        };

        if (options?.signal) {
            config.signal = options.signal;
        }

        const res = await this.axiosInstance(config);
        return res.data as TResponse;
    }

    // # ------------------------------------------------------------------
    // # getPath
    // # ------------------------------------------------------------------

    private getPath(api: string, options?: PathOptions): string {
        let path = api;

        if (typeof options === 'undefined') {
            return path;
        }

        const hasIdPlaceholder = api.includes('$id');
        if (hasIdPlaceholder && options.id != null) {
            path = path.replace('$id', String(options.id));
        } else if (!hasIdPlaceholder && options.id != null) {
            path = `${path}/${options.id}`;
        }

        let queryString = '';
        if (options.filters) {
            const validFilters = Object.entries(options.filters)
                .filter(([_, value]) => value !== null && value !== undefined)
                .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

            if (validFilters.length > 0) {
                queryString = `?${validFilters.join('&')}`;
            }
        }

        return `${path}${queryString}`;
    }

    // # ------------------------------------------------------------------
    // # APIMethods
    // # ------------------------------------------------------------------

    private APIMethods(baseUrl: string): ApiEndpointMethods {
        return {
            get: (options) => this.request('GET', baseUrl, undefined, options),
            post: (data, options) => this.request('POST', baseUrl, data, options),
            put: (data, options) => this.request('PUT', baseUrl, data, options),
            patch: (data, options) => this.request('PATCH', baseUrl, data, options),
            del: (options) => this.request('DELETE', baseUrl, undefined, options),
        };
    }
}

export { ApiClient };
