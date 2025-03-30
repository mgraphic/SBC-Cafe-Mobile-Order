import request from 'supertest';
import express from 'express';
import { storeRouter } from './store.routes';
import { environment } from '../environment';
import demoItems from '../shared/demo-items.json';

const app = express();
app.use('/store', storeRouter);

describe('storeRouter', () => {
    it('should deny access with invalid token', async () => {
        environment.accessToken = 'valid-token';
        const response = await request(app)
            .get('/store/menu')
            .set('x-access-token', 'invalid-token');
        expect(response.status).toBe(403);
        expect(response.text).toBe('Access denied. Invalid token');
    });

    it('should allow access with valid token', async () => {
        environment.accessToken = 'valid-token';
        const response = await request(app)
            .get('/store/menu')
            .set('x-access-token', 'valid-token');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(demoItems);
    });

    it('should allow access without token if no token is set in environment', async () => {
        environment.accessToken = '';
        const response = await request(app).get('/store/menu');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(demoItems);
    });
});
