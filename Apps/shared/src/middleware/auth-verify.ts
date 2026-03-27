import { NextFunction, Request, RequestHandler, Response } from 'express';
import { verifyAccessToken } from '../user/jwt.utils';
import { TokenUser } from '../user/token-user';

export function authVerify(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
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
    };
}
