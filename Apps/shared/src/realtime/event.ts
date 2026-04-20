import z from 'zod';
import {
    RealtimeEventType,
    RealtimeEvent,
    realtimeEventTypes,
    RealtimeRoom,
    AnyEventPayload,
    RealtimePartialEvent,
} from './realtime.model';

const realtimeEventSchema = z
    .object({
        type: z.enum(realtimeEventTypes),
        version: z.number().int().positive().default(1),
        rooms: z.array(z.string() as z.ZodType<RealtimeRoom>).optional(),
    })
    .strict();

export function createRealtimeEvent<T = AnyEventPayload>(
    type: RealtimeEventType,
    payload: T,
    params: Partial<Pick<RealtimeEvent, 'version' | 'rooms'>> = {},
): RealtimeEvent<T> {
    const baseEvent = {
        type,
        ...params,
    };
    const parsedEvent: Pick<
        RealtimeEvent<T>,
        'type' | 'version' | 'rooms'
    > = realtimeEventSchema.parse(baseEvent);
    const event: RealtimeEvent<T> = {
        ...parsedEvent,
        timestamp: new Date().toISOString(),
        payload,
    };

    return event;
}

export function toRealtimeEvent<T = AnyEventPayload>(
    partialEvent: RealtimePartialEvent<T>,
): RealtimeEvent<T> {
    const rooms =
        partialEvent.rooms && Array.isArray(partialEvent.rooms)
            ? partialEvent.rooms
            : undefined;
    const event: RealtimeEvent<T> = {
        type: partialEvent.type,
        version: partialEvent.version ?? 1,
        timestamp: partialEvent.timestamp ?? new Date().toISOString(),
        payload: partialEvent.payload as T,
        rooms: rooms,
    };

    return event;
}
