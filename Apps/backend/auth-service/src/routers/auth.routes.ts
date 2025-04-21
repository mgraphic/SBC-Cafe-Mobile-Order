import { NextFunction, Request, Response, Router } from 'express';
import { login, logout, refresh, register } from '../handlers/auth.handler';
import { verifyAccessToken } from '../shared/jwt-utils';
import { TokenUser } from '../shared/token-user';

export const authRouter: Router = Router();

// Public API
authRouter.post('/login', login);
authRouter.get('/logout', logout);
authRouter.get('/refresh', refresh);

authRouter.use((req: Request, res: Response, next: NextFunction): void => {
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

    req.user = new TokenUser(verified);

    next();
});

// Private API
authRouter.post('/register', register);
