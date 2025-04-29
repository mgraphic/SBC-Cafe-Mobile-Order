export * from './aws';
export * from './middleware';
export * from './user';

import 'express';
import { TokenUser } from './user';

declare global {
    export namespace Express {
        export interface Request {
            user?: TokenUser;
        }
    }
}
