export interface IUser {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    refreshTokens: string[];
}

export const jwtPayloadFields = [
    'userName',
    'email',
    'firstName',
    'lastName',
] as const;

export type JwtUserPayload = Pick<IUser, (typeof jwtPayloadFields)[number]>;
