export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    createdAt: string;
    isActive: boolean;
    role: UserRole;
    permissions: UserPermission[];
    refreshTokens: string[];
}

export const jwtPayloadFields = [
    'id',
    'email',
    'firstName',
    'lastName',
    'createdAt',
    'role',
    'permissions',
] as const;

export type JwtUserPayload = Pick<IUser, (typeof jwtPayloadFields)[number]>;

export const rbacRoles = {
    DEFAULT: 'Default Access User',
    STAFF: 'Cafe Staff',
    ADMIN: 'Admin User',
    OWNER: 'Owner (superuser)',
} as const;

export type UserRole = keyof typeof rbacRoles;

export const rbacRoleHiarchyMap: Record<UserRole, number> = {
    DEFAULT: 0,
    STAFF: 1000,
    ADMIN: 2000,
    OWNER: 9999,
} as const;

export const rbacPermissionGroups = ['ORDER', 'USER'] as const;

export type UserPermissionGroup = (typeof rbacPermissionGroups)[number];

export type UserPermission = `${UserPermissionGroup}_${string}`;

export const rbacPermissions: Readonly<Record<UserPermission, string>> = {
    ORDER_ACCEPT: 'Accept an order',
    ORDER_CANCEL: 'Cancel an order',
    ORDER_COMPLETE: 'Complete an order',
    USER_VIEW: 'View a user',
    USER_ADD: 'Add a user',
    USER_EDIT: 'Edit a user',
    USER_DELETE: 'Delete a user',
};

export const rbacRolePermissionGroupAllowances: Readonly<
    Record<UserRole, Array<UserPermissionGroup | UserPermission>>
> = {
    DEFAULT: [],
    STAFF: ['ORDER_ACCEPT', 'ORDER_COMPLETE'],
    ADMIN: ['ORDER', 'USER_VIEW', 'USER_ADD', 'USER_EDIT'],
    OWNER: ['ORDER', 'USER'],
};
