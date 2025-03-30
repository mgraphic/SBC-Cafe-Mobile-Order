import { NextFunction, Request, Response, Router } from 'express';
import { environment } from '../environment';
import { getMenu } from '../handlers/product.handler';

export const storeRouter: Router = Router();

// Public API
storeRouter.get('/', (_, res) => {
    res.status(200).json({
        message: 'Welcome to the Cafe Store API',
        version: '1.0.0',
    });
});

// Middleware to check for access token
storeRouter.use((req: Request, res: Response, next: NextFunction) => {
    if (environment.accessToken) {
        if (req.headers['x-access-token'] !== environment.accessToken) {
            res.status(403).send('Access denied. Invalid token');
            return;
        }
    }

    next();
});

// Private API
storeRouter.get('/menu', getMenu);
