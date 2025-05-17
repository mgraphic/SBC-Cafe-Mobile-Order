export * from './aws';
export * from './logger';
export * from './middleware';
export * from './tracker';
export * from './user';
export * from './validator';
export * from './shared-environment';

import 'express';
import { TokenUser } from './user';

declare global {
    export namespace Express {
        export interface Request {
            user?: TokenUser;
        }
    }
}
