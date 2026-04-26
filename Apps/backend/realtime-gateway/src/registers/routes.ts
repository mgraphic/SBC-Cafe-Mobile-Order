import type { Express, Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import { environment } from '../environment';
import {
    newOrderAlertRoom,
    OrderEventPayload,
    orderRoom,
    RealtimeEvent,
    RealtimeRoom,
    SessionEventPayload,
    sessionRoom,
    toRealtimeEvent,
} from 'sbc-cafe-shared-module';
import { logger } from '../shared/logger.utils';

function requireInternalApiKey(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const apiKey = req.header('x-internal-api-key');

    if ('x-internal-api-key' in req.headers) {
        req.headers['x-internal-api-key'] = '[REDACTED]';
    }

    if (!apiKey || apiKey !== environment.privateSharedApiKey) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
}

export function registerInternalRoutes(app: Express, io: Server): void {
    app.post('/publish', requireInternalApiKey, (req, res) => {
        const event = toRealtimeEvent(req.body);

        if (!('type' in event && 'payload' in event)) {
            res.status(400).json({
                error: 'Invalid event',
                details: 'Missing type or payload',
            });
            return;
        }

        publishEvent(io, event);

        res.status(202).json({ ok: true });
    });
}

function publishEvent(io: Server, event: RealtimeEvent): void {
    const emittedRooms = new Set<RealtimeRoom>();

    const emitToRoom = (room: RealtimeRoom): void => {
        if (!room || emittedRooms.has(room)) return;
        emittedRooms.add(room);
        io.emit(room, event);
    };

    switch (event.type) {
        case 'order.created':
            const { orderId } = event.payload as OrderEventPayload;
            emitToRoom(orderRoom(orderId));
            break;

        case 'session.created':
            const { sessionId } = event.payload as SessionEventPayload;
            emitToRoom(sessionRoom(sessionId));
            break;

        case 'new-order-alert':
            emitToRoom(newOrderAlertRoom());
            break;

        default:
            logger.warn(
                `Received event with unrecognized type: ${event.type satisfies never}`,
            );
    }

    for (const room of event.rooms ?? []) {
        emitToRoom(room);
    }
}
