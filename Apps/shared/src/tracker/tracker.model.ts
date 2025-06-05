export interface ITracker {
    id: string;
    createdAt: string;
    userId: string;
    endpoint: string;
    ip: string;
    userAgent: string;
}

export type TrackerLog = Omit<ITracker, 'id' | 'createdAt'>;

export const userTrackerLogsLookups = [
    'endpoint',
    'id',
    'ip',
    'userId',
] as const;

export type UserTrackerLogsLookup = (typeof userTrackerLogsLookups)[number];
