import http from 'node:http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { environment } from './environment';
// // @ts-ignore
import pkg from '../package.json' with { type: 'json' };
import { apiLogger } from 'sbc-cafe-shared-module';
import { logger } from './shared/logger.utils';
import { registerSocketHandlers } from './registers/socket';
import { registerInternalRoutes } from './registers/routes';

(async function () {
    const app = express();

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(apiLogger(logger));
    app.use(express.json({ limit: '1mb' }));
    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || environment.corsOrigins.includes(origin)) {
                    callback(null, true);
                    return;
                }
                callback(new Error(`Origin not allowed: ${origin}`));
            },
            credentials: true,
        }),
    );

    // Version
    app.get('/', (_: unknown, res: Response) => {
        res.status(200).json({
            message: 'Welcome to the Realtime Gateway API',
            version: pkg.version,
        });
    });

    const server = http.createServer(app);

    const io = new Server(server, {
        path: environment.socketPath,
        cors: {
            origin: environment.corsOrigins,
            credentials: true,
        },
    });

    registerSocketHandlers(io);
    registerInternalRoutes(app, io);

    server.listen(environment.port, () => {
        logger.info(`Realtime Gateway started PORT=${environment.port}`, {
            port: environment.port,
            env: environment.env,
            socketPath: environment.socketPath,
        });
    });

    const shutdown = async (signal: string) => {
        logger.info('shutdown signal received', { signal });

        io.close();
        server.close(async () => {
            process.exit(0);
        });
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
})().catch((error) => {
    logger.error('failed to start realtime-gateway', error);
    process.exit(1);
});
