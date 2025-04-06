import { NextFunction, Request, Response, Router } from 'express';
import { login, logout, refresh, register } from '../handlers/auth.handler';
import { verifyAccessToken } from '../shared/jwt-utils';

export const autheRouter: Router = Router();

// Public API
autheRouter.post('/login', login);
autheRouter.get('/logout', logout);
autheRouter.get('/refresh', refresh);

autheRouter.use((req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.sendStatus(401);
        return;
    }

    const token = authHeader.split(' ')[1];
    const verified = verifyAccessToken(token);

    if (!verified) {
        res.sendStatus(403);
        return;
    }

    next();
});

// Private API
autheRouter.post('/register', register);
