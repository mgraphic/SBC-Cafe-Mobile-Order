import type { Stripe } from 'stripe';
import { StripeCheckoutSessionMetadata } from '../stripe/stripe.model';
import { UserOnDutyUpdate } from '../user/user.model';

export const realtimeEventTypes = [
    'order.created',
    'order.updated',
    'session.created',
    'new-order-alert',
    'on-duty-alert',
    'store-status-alert',
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
    csid: string;
}

export interface OrderUpdatedEventPayload {
    csid: string;
}

export interface OnDutyAlertEventPayload {
    users: UserOnDutyUpdate[];
}

export interface SessionEventPayload {
    sessionId: string;
}

export interface StoreStatusEventPayload {
    isStoreOpen: boolean;
    storeOpenDuration?: number;
}

export interface NewOrderAlertEventPayload {
    csid: string;
    items: Stripe.LineItem[];
    session?: Stripe.Checkout.Session;
    metadata?: Stripe.Metadata & StripeCheckoutSessionMetadata;
}

export type AnyEventPayload =
    | OrderEventPayload
    | OrderUpdatedEventPayload
    | SessionEventPayload
    | NewOrderAlertEventPayload
    | OnDutyAlertEventPayload
    | StoreStatusEventPayload;

export type OrderRoomType = `csid:${string}`;

export type SessionRoomType = `session:${string}`;

export type NewOrderAlertRoomType = 'new-order-alerts';

export type OnDutyAlertRoomType = 'on-duty-alerts';

export type OrderUpdatedRoomType = 'order-updated-alerts';

export type StoreStatusRoomType = 'store-status-alerts';

export type RealtimeRoom =
    | OrderRoomType
    | OrderUpdatedRoomType
    | SessionRoomType
    | NewOrderAlertRoomType
    | OnDutyAlertRoomType
    | StoreStatusRoomType;
