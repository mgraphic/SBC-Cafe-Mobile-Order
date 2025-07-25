import { Router } from 'express';
import { authVerify, userLogTracker } from 'sbc-cafe-shared-module';
import { login, logout, refresh, register } from '../handlers/auth.handler';

export const authRouter: Router = Router();

// Public API
authRouter.post('/login', login);
authRouter.get('/logout', logout);
authRouter.get('/refresh', refresh);

authRouter.use(authVerify());
authRouter.use(userLogTracker());

// Private API
authRouter.post('/register', register);
