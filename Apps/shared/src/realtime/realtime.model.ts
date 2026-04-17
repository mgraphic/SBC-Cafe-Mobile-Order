export const realtimeEventTypes = [
    'order.created',
    'session.created',
    'new-order-alert',
] as const;

export type RealtimeEventType = (typeof realtimeEventTypes)[number];

export type RealtimeEvent<TPayload = AnyEventPayload> = {
    type: RealtimeEventType;
    version: number;
    timestamp: string;
    rooms?: RealtimeRoom[];
    payload: TPayload;
};

export type RealtimePartialEvent<TPayload = AnyEventPayload> = Partial<
    Omit<RealtimeEvent<TPayload>, 'type' | 'payload'>
> &
    Pick<RealtimeEvent<TPayload>, 'type' | 'payload'>;

export interface OrderEventPayload {
    orderId: string;
}

export interface SessionEventPayload {
    sessionId: string;
}

export interface NewOrderAlertEventPayload {
    orderId: string;
    sessionId: string;
}

export type AnyEventPayload =
    | OrderEventPayload
    | SessionEventPayload
    | NewOrderAlertEventPayload;

export type OrderRoomType = `order:${string}`;

export type SessionRoomType = `session:${string}`;

export type NewOrderAlertRoomType = 'new-order-alerts';

export type RealtimeRoom =
    | OrderRoomType
    | SessionRoomType
    | NewOrderAlertRoomType;
