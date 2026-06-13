import { apiLogger } from 'sbc-cafe-shared-module';
import express, { Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { adminRouter } from './routes/admin.routes';
import { environment } from './environment';
import { handleWebhook } from './handlers/webhook.handler';
import { logger } from './shared/logger.utils';
import { storeRouter } from './routes/store.routes';
// @ts-ignore
import pkg from '../package.json' with { type: 'json' };

const app = express();
app.use(helmet());

// Webhook endpoint — must be registered BEFORE express.json() to receive raw body
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Middleware (registered after /webhook to avoid parsing raw body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLogger(logger));

// Version
app.get('/', (_: unknown, res: Response) => {
    res.status(200).json({
        message: 'Welcome to the Cafe Service API',
        version: pkg.version,
    });
});

// Routes
app.use('/api/v1/store', storeRouter);
app.use('/api/v1/admin', adminRouter);

// Serve
app.listen(environment.port, () => {
    console.log(`Cafe Service is running on port ${environment.port}`);
});
