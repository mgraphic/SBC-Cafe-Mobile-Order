import {
    NewOrderAlertRoomType,
    OrderRoomType,
    SessionRoomType,
    OrderUpdatedRoomType,
    OnDutyAlertRoomType,
} from './realtime.model';

export function orderRoom(orderId: string): OrderRoomType {
    return `csid:${orderId}`;
}

export function sessionRoom(sessionId: string): SessionRoomType {
    return `session:${sessionId}`;
}

export function newOrderAlertRoom(): NewOrderAlertRoomType {
    return 'new-order-alerts';
}

export function orderUpdatedRoom(): OrderUpdatedRoomType {
    return 'order-updated-alerts';
}

export function onDutyAlertRoom(): OnDutyAlertRoomType {
    return 'on-duty-alerts';
}
