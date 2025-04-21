import 'express';
import { TokenUser } from '../../shared/token-user';

declare global {
    namespace Express {
        export interface Request {
            user?: TokenUser;
        }
    }
}
