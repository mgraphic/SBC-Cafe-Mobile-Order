import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { environment } from './environment';
import rateLimit from 'express-rate-limit';
import { autheRouter } from './routers/auth.routes';
// @ts-ignore
import pkg from '../package.json' with { type: 'json' };
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 3 * 60 * 1000, limit: 20 }));
app.use(cookieParser());

// Version
app.get('/', (_: unknown, res: Response) => {
    res.status(200).json({
        message: 'Welcome to the Auth Service API',
        version: pkg.version,
    });
});

// Routes
app.use('/api/v1', autheRouter);

app.listen(environment.port, () => {
    console.log(`Auth Service is running on port ${environment.port}`);
});
