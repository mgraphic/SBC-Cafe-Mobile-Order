import { Request, Response } from 'express';
import {
    ApiError,
    RealtimePartialEvent,
    NewOrderAlertEventPayload,
    sharedEnvironment,
} from 'sbc-cafe-shared-module';

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

        fetch(`${sharedEnvironment.realtime.endpoint}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
