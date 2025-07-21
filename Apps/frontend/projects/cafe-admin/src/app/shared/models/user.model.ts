import { IUser } from 'sbc-cafe-shared-module';

export type UserResponse = Omit<IUser, 'passwordHash' | 'refreshTokens'>;
