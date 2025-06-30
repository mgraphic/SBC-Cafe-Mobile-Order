import { apiLogger } from 'sbc-cafe-shared-module';
import express, { Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { environment } from './environment';
import { authRouter } from './routers/auth.routes';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './shared/logger.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
    readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 3 * 60 * 1000, limit: 20 }));
app.use(cookieParser());
app.use(apiLogger(logger));

// Version
app.get('/', (_: unknown, res: Response) => {
    res.status(200).json({
        message: 'Welcome to the Auth Service API',
        version: pkg.version,
    });
});

// Routes
app.use('/api/v1', authRouter);

app.listen(environment.port, () => {
    console.log(`Auth Service is running on port ${environment.port}`);
});
