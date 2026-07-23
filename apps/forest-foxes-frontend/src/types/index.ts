export interface Fox {
    id: string;
    color: string;
    createdAt: string;
}

export interface Location {
    id: number;
    name: string;
    gridRow: number;
    gridCol: number;
    createdAt: string;
}

export interface Observation {
    id: string;
    foxId: string;
    locationId: number;
    hasPrey: boolean;
    suspicionLevel: number;
    time: string;
    status: 'pending' | 'processed';
    createdAt: string;
    updatedAt: string;
    fox: Fox;
    location: Location;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface StatsResponse {
    total: number;
    pending: number;
    processed: number;
    uniqueFoxes: number;
    avgSuspicion: number;
    byColor: { color: string; count: number; avgSuspicion: number }[];
    byLocation: { locationId: number; name: string; count: number; avgSuspicion: number }[];
    byHasPrey: { hasPrey: boolean; count: number; avgSuspicion: number }[];
    suspicionBuckets: { label: string; min: number; max: number; count: number }[];
}

export interface TopSuspiciousItem {
    foxId: string;
    color: string;
    avgSuspicion: number;
    count: number;
    firstSeen: string;
    lastSeen: string;
    lastLocation: string | null;
}

export interface CreateObservationPayload {
    id: string;
    foxId: string;
    locationId: number;
    color: string;
    hasPrey: boolean;
    suspicionLevel: number;
    time: string;
}

export type TabValue = 'all' | 'suspicious' | 'processed';
