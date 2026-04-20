import { DisconnectReason, Server, Socket } from 'socket.io';
import { AcknowledgeFn } from '../models/socket.model';
import { RealtimeRoom } from 'sbc-cafe-shared-module';
import { logger } from '../shared/logger.utils';

export function registerSocketHandlers(io: Server): void {
    io.on('connection', async (socket) => {
        socket.on(
            'joinRoom',
            async (room: RealtimeRoom, ack?: AcknowledgeFn) => {
                if (!canJoinRoom(socket, room)) {
                    ack?.({ ok: false, error: 'Forbidden' });
                    return;
                }

                logger.info(`Socket ${socket.id} joining room ${room}`);

                socket.join(room);
                ack?.({ ok: true });
            },
        );

        socket.on(
            'leaveRoom',
            async (room: RealtimeRoom, ack?: AcknowledgeFn) => {
                logger.info(`Socket ${socket.id} leaving room ${room}`);
                socket.leave(room);
                ack?.({ ok: true });
            },
        );

        socket.on('disconnect', (reason: DisconnectReason): void => {
            logger.info(`Socket ${socket.id} disconnected: ${reason}`);
        });
    });
}

function canJoinRoom(socket: Socket, room: RealtimeRoom): boolean {
    // TODO: Implement your logic to determine if the socket can join the room
    // For example, you might check if the user is authenticated or has the right permissions
    return true; // Allow all for now
}
