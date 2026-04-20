import { io, Socket } from 'socket.io-client';
import { RealtimeEventListener } from './realtime-event-listener';
import { AnyEventPayload, RealtimeRoom, RealtimeEvent } from './realtime.model';
import { orderRoom, sessionRoom, newOrderAlertRoom } from './rooms';

export class RealtimeService {
    private static instance?: RealtimeService;

    public static getInstance(
        url?: string,
        sessionId?: string,
        token?: string,
    ): RealtimeService {
        if (!RealtimeService.instance) {
            if (!url) {
                throw new Error(
                    'RealtimeService has not been initialized. Provide a url on first call.',
                );
            }
            RealtimeService.instance = new RealtimeService(
                url,
                sessionId,
                token,
            );
        }
        return RealtimeService.instance;
    }

    public static resetInstance(): void {
        RealtimeService.instance?.disconnect();
        RealtimeService.instance = undefined;
    }

    private socket?: Socket;
    private readonly realtimeEventListeners = new Set<
        RealtimeEventListener<any>
    >();

    private constructor(
        private readonly url: string,
        private readonly sessionId?: string,
        private readonly token?: string,
    ) {}

    public connect(): void {
        this.socket = io(this.url, {
            path: '/socket.io',
            auth: {
                sessionId: this.sessionId,
                token: this.token,
            },
        });
    }

    // Admin & Customer
    public joinOrder(orderId: string): void {
        this.socket?.emit(
            'joinRoom',
            orderRoom(orderId),
            (...ack: unknown[]) => {
                console.log(`Joined ${orderRoom(orderId)}`, ...ack);
            },
        );
    }

    public joinSession(sessionId: string): void {
        this.socket?.emit(
            'joinRoom',
            sessionRoom(sessionId),
            (...ack: unknown[]) => {
                console.log(`Joined ${sessionRoom(sessionId)}`, ...ack);
            },
        );
    }

    // Admin only
    public joinNewOrderAlert(): void {
        this.socket?.emit(
            'joinRoom',
            newOrderAlertRoom(),
            (...ack: unknown[]) => {
                console.log('Joined New Order Alert Room', ...ack);
            },
        );
    }

    public registerEventListener<T extends AnyEventPayload>(
        room: RealtimeRoom,
        callback: (event: RealtimeEvent<T>) => void,
    ): RealtimeEventListener<T> {
        if (!this.socket) {
            throw new Error('Socket not connected');
        }
        const listener = new RealtimeEventListener<T>(this, room, callback);
        this.realtimeEventListeners.add(listener);
        return listener;
    }

    public unregisterEventListener<T extends AnyEventPayload>(
        listener: RealtimeEventListener<T>,
    ): void {
        listener.off();
        this.realtimeEventListeners.delete(listener);
    }

    public unregisterAllEventListeners(): void {
        this.realtimeEventListeners.forEach((listener) => {
            listener.off();
            this.realtimeEventListeners.delete(listener);
        });
    }

    public getSocket(): Socket | undefined {
        return this.socket;
    }

    public disconnect(): void {
        this.socket?.disconnect();
    }

    public isReady(): boolean {
        return this.socket?.connected ?? false;
    }
}
