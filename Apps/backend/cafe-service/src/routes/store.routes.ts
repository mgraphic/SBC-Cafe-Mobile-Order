import { NextFunction, Request, Response, Router } from 'express';
import { environment } from '../environment';
import { getMenu } from '../handlers/product.handler';

export const storeRouter: Router = Router();

// Public API

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
