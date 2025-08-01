import { Router } from 'express';
import { authVerify, userLogTracker } from 'sbc-cafe-shared-module';
import {
    activateUser,
    addUser,
    canActivateUser,
    deleteUser,
    getUser,
    getUserById,
    getUserLogs,
    getUsers,
    updateUser,
} from '../handlers/user.handler';

export const adminRouter: Router = Router();

// Public API
adminRouter.get('/canActivateUser/:id', canActivateUser);
adminRouter.put('/activateUser/:id', activateUser);

// Middleware
adminRouter.use(authVerify());
adminRouter.use(userLogTracker());

// Private API
adminRouter.get('/getUsers', getUsers);
adminRouter.get('/getUser/:email', getUser);
adminRouter.get('/getUserId/:id', getUserById);
adminRouter.post('/addUser', addUser);
adminRouter.put('/updateUser/:id', updateUser);
adminRouter.delete('/deleteUser/:id', deleteUser);
adminRouter.post('/getUserLogs', getUserLogs);
