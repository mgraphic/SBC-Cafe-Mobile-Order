import request from 'supertest';
import express from 'express';
import { storeRouter } from './store.routes';
import { environment } from '../environment';

jest.mock('../handlers/product.handler', () => ({
    getAllItems: jest.fn((_req: any, res: any) => res.status(200).json([])),
    getItemById: jest.fn((_req: any, res: any) => res.status(200).json({})),
    getItemBySlug: jest.fn((_req: any, res: any) => res.status(200).json({})),
}));

jest.mock('../handlers/order.handler', () => ({
    submitOrder: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true })),
}));

const app = express();
app.use('/store', storeRouter);

describe('storeRouter', () => {
    it('should deny access with invalid API key', async () => {
        environment.publishedSharedApiKey = 'valid-api-key';
        const response = await request(app)
            .get('/store/items')
            .set('x-public-api-key', 'invalid-api-key');
        expect(response.status).toBe(403);
        expect(response.text).toBe('Access denied. Invalid token');
    });

    it('should allow access with valid API key', async () => {
        environment.publishedSharedApiKey = 'valid-api-key';
        const response = await request(app)
            .get('/store/items')
            .set('x-public-api-key', 'valid-api-key');
        expect(response.status).toBe(200);
    });

    it('should allow access without API key if no key is set in environment', async () => {
        environment.publishedSharedApiKey = null;
        const response = await request(app).get('/store/items');
        expect(response.status).toBe(200);
    });
});
