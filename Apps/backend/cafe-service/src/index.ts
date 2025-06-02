import { apiLogger } from 'sbc-cafe-shared-module';
import express, { Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { adminRouter } from './routes/admin.routes';
import { environment } from './environment';
import { storeRouter } from './routes/store.routes';
// @ts-ignore
import pkg from '../package.json' with { type: 'json' };
import { logger } from './shared/logger.utils';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
app.use(apiLogger(logger))


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
