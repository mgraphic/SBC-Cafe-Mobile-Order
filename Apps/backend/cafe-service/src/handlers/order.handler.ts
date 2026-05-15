import { Request, Response } from 'express';
import {
    ApiError,
    RealtimePartialEvent,
    NewOrderAlertEventPayload,
} from 'sbc-cafe-shared-module';
import { environment } from '../environment';

export async function submitOrder(
    req: Request,
    res: Response<{ ok: boolean } | ApiError>,
): Promise<void> {
    try {
        const event: RealtimePartialEvent<NewOrderAlertEventPayload> = {
            type: 'new-order-alert',
            payload: {
                orderId: req.body.orderId,
                sessionId: req.body.sessionId,
            },
        };

        fetch(`${environment.realtime.endpoint}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Internal-Api-Key': environment.privateSharedApiKey,
            },
            body: JSON.stringify(event),
        });
        res.status(200).json({ ok: true });
    } catch (error) {
        res.status(500).json(
            error instanceof Error
                ? { error: error.message }
                : { error: 'Unknown error' },
        );
    }
}
