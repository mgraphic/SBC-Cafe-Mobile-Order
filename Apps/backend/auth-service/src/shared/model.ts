export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    createdAt: string;
    isActive: boolean;
    refreshTokens: string[];
}

export const jwtPayloadFields = [
    'id',
    'email',
    'firstName',
    'lastName',
    'createdAt',
] as const;

export type JwtUserPayload = Pick<IUser, (typeof jwtPayloadFields)[number]>;

export type DynamoDbQueryValue = {
    value: any;
    operation: '=' | '>' | '<' | '>=' | '<=';
};

export type DynamoDbQueryItem = {
    [key: string]: DynamoDbQueryValue;
};
