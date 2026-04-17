import {
    NewOrderAlertRoomType,
    OrderRoomType,
    SessionRoomType,
} from './realtime.model';

export function orderRoom(orderId: string): OrderRoomType {
    return `order:${orderId}`;
}

export function sessionRoom(sessionId: string): SessionRoomType {
    return `session:${sessionId}`;
}

export function newOrderAlertRoom(): NewOrderAlertRoomType {
    return 'new-order-alerts';
}
