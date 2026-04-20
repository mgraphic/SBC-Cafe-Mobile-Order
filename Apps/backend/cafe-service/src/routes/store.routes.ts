import { NextFunction, Request, Response, Router } from 'express';
import { isProductId } from 'sbc-cafe-shared-module';
import { environment } from '../environment';
import {
    getAllItems,
    getItemById,
    getItemBySlug,
} from '../handlers/product.handler';
import { submitOrder } from '../handlers/order.handler';

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
storeRouter.get('/items', getAllItems);
storeRouter.get('/item/:identifier', (req: Request, res: Response) => {
    const identifier = req.params.identifier as string;

    if (isProductId(identifier)) {
        req.params.id = identifier;
        getItemById(req, res);
    } else {
        req.params.slug = identifier;
        getItemBySlug(req, res);
    }
});
storeRouter.post('/submit-order', submitOrder);
