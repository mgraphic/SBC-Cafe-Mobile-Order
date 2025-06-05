import { Router } from 'express';
import { authVerify, userLogTracker } from 'sbc-cafe-shared-module';
import { getUserLogs, getUsers } from '../handlers/user.handler';

export const adminRouter: Router = Router();

// Public API

// Middleware
adminRouter.use(authVerify());
adminRouter.use(userLogTracker());

// Private API
adminRouter.get('/getUsers', getUsers);
adminRouter.post('/getUserLogs', getUserLogs);
