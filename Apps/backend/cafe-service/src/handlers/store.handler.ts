import { Request, Response } from 'express';
import {
    RealtimePartialEvent,
    SettingsService,
    StoreStatusEventPayload,
} from 'sbc-cafe-shared-module';
import { environment } from '../environment';
import { logger } from '../shared/logger.utils';

export async function isStoreOpen(_: Request, res: Response): Promise<void> {
    const settingsService = SettingsService.getInstance();
    try {
        const storeOpen = await settingsService.isStoreOpen();
        res.status(200).json({ isStoreOpen: storeOpen });
    } catch (error) {
        res.status(500).json({ error: 'Failed to determine store status' });
    }
}

export async function openStore(req: Request, res: Response): Promise<void> {
    const settingsService = SettingsService.getInstance();
    const duration = Number(req.body.duration);

    try {
        await settingsService.openStore(duration);
        res.status(200).json({ message: 'Store successfully opened' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to open store' });
    }

    // Publish real-time event to all subscribers
    try {
        const rtEvent: RealtimePartialEvent<StoreStatusEventPayload> = {
            type: 'store-status-alert',
            payload: {
                isStoreOpen: true,
                storeOpenDuration: duration,
            },
        };

        await fetch(`${environment.realtime.endpoint}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Internal-Api-Key': environment.privateSharedApiKey,
            },
            body: JSON.stringify(rtEvent),
        });
    } catch (error) {
        logger.error('Failed to publish real-time event', error);
    }
}

export async function closeStore(_: Request, res: Response): Promise<void> {
    const settingsService = SettingsService.getInstance();

    try {
        await settingsService.closeStore();
        res.status(200).json({ message: 'Store successfully closed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to close store' });
    }

    // Publish real-time event to all subscribers
    try {
        const rtEvent: RealtimePartialEvent<StoreStatusEventPayload> = {
            type: 'store-status-alert',
            payload: {
                isStoreOpen: false,
            },
        };

        await fetch(`${environment.realtime.endpoint}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Internal-Api-Key': environment.privateSharedApiKey,
            },
            body: JSON.stringify(rtEvent),
        });
    } catch (error) {
        logger.error('Failed to publish real-time event', error);
    }
}
