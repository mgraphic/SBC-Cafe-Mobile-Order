export interface ITracker {
    id: string;
    createdAt: string;
    userId: string;
    endpoint: string;
    ip: string;
    userAgent: string;
}

export type TrackerLog = Omit<ITracker, 'id' | 'createdAt'>;
