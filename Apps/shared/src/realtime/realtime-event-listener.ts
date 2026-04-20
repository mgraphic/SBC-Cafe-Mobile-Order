import { RealtimeService } from './realtime-service';
import { AnyEventPayload, RealtimeRoom, RealtimeEvent } from './realtime.model';

export class RealtimeEventListener<T extends AnyEventPayload> {
    private isOff = false;
    private isMarkedForGarbageCollection = false;

    public constructor(
        private readonly realtimeService: RealtimeService,
        private readonly eventName: RealtimeRoom,
        private readonly callback: (event: RealtimeEvent<T>) => void,
    ) {}

    public on(): RealtimeEventListener<T> {
        this.realtimeService.getSocket()?.on(this.eventName, this.callback);
        return this;
    }

    public once(): RealtimeEventListener<T> {
        this.realtimeService.getSocket()?.once(this.eventName, this.callback);
        return this;
    }

    public repeat(times: number): RealtimeEventListener<T> {
        let count = 0;
        const wrapper = (event: RealtimeEvent<T>) => {
            if (count >= times) {
                this.off();
                return;
            }
            this.callback(event);
            count++;
        };
        this.realtimeService.getSocket()?.on(this.eventName, wrapper);
        return this;
    }

    public takeUntil(promise: Promise<unknown>): RealtimeEventListener<T> {
        promise.then(() => {
            console.log(
                'takeUntil resolved, unsubscribing from event',
                this.eventName,
            );
            this.off();
        });
        this.on();
        return this;
    }

    public off(): RealtimeEventListener<T> {
        if (!this.isOff) {
            this.isOff = true;
            this.realtimeService
                .getSocket()
                ?.off(this.eventName, this.callback);
        }

        if (!this.isMarkedForGarbageCollection) {
            this.isMarkedForGarbageCollection = true;
            this.realtimeService.unregisterEventListener(this);
        }

        return this;
    }
}
