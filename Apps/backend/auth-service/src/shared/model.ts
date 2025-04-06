export interface IUser {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    refreshTokens: string[];
}

export type JwtUserPayload = Pick<
    IUser,
    'userName' | 'email' | 'firstName' | 'lastName'
>;
