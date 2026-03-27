import { TokenUser } from './user';

declare global {
    namespace Express {
        interface Request {
            user?: TokenUser;
        }
    }
}
