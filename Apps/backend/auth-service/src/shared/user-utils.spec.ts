import {
    roleCompare,
    getUserPermissionGroupFromPermission,
    isPermissionGroup,
    isPermission,
    isRoleInPermissionGroup,
} from './user-utils';

describe('user-utils', () => {
    it('should compare roles correctly', () => {
        expect(roleCompare('DEFAULT', 'DEFAULT')).toBe(0);
        expect(roleCompare('DEFAULT', 'STAFF')).toBe(-1);
        expect(roleCompare('DEFAULT', 'ADMIN')).toBe(-1);
        expect(roleCompare('DEFAULT', 'OWNER')).toBe(-1);
        expect(roleCompare('STAFF', 'DEFAULT')).toBe(1);
        expect(roleCompare('STAFF', 'STAFF')).toBe(0);
        expect(roleCompare('STAFF', 'ADMIN')).toBe(-1);
        expect(roleCompare('STAFF', 'OWNER')).toBe(-1);
        expect(roleCompare('ADMIN', 'DEFAULT')).toBe(1);
        expect(roleCompare('ADMIN', 'STAFF')).toBe(1);
        expect(roleCompare('ADMIN', 'ADMIN')).toBe(0);
        expect(roleCompare('ADMIN', 'OWNER')).toBe(-1);
        expect(roleCompare('OWNER', 'DEFAULT')).toBe(1);
        expect(roleCompare('OWNER', 'STAFF')).toBe(1);
        expect(roleCompare('OWNER', 'ADMIN')).toBe(1);
        expect(roleCompare('OWNER', 'OWNER')).toBe(0);
    });

    it('should get user permission group from permission', () => {
        expect(getUserPermissionGroupFromPermission('ORDER_X')).toBe('ORDER');
        expect(getUserPermissionGroupFromPermission('USER_X')).toBe('USER');
        expect(getUserPermissionGroupFromPermission('INVALID_X' as any)).toBe(
            undefined
        );
    });

    it('should identify if a permission is a group', () => {
        expect(isPermissionGroup('ORDER')).toBe(true);
        expect(isPermissionGroup('ORDER_X')).toBe(false);
        expect(isPermissionGroup('USER')).toBe(true);
        expect(isPermissionGroup('USER_X')).toBe(false);
    });

    it('should identify if a permission is a specific permission', () => {
        expect(isPermission('ORDER_ACCEPT')).toBe(true);
        expect(isPermission('ORDER_CANCEL')).toBe(true);
        expect(isPermission('ORDER_COMPLETE')).toBe(true);
        expect(isPermission('ORDER_X')).toBe(false);
        expect(isPermission('ORDER')).toBe(false);
        expect(isPermission('USER_VIEW')).toBe(true);
        expect(isPermission('USER_ADD')).toBe(true);
        expect(isPermission('USER_EDIT')).toBe(true);
        expect(isPermission('USER_DELETE')).toBe(true);
        expect(isPermission('USER_X')).toBe(false);
        expect(isPermission('USER')).toBe(false);
    });

    it('should identify if a role is in a permission group', () => {
        expect(isRoleInPermissionGroup('OWNER', 'ORDER')).toBe(true);
        expect(isRoleInPermissionGroup('OWNER', 'USER')).toBe(true);
        expect(isRoleInPermissionGroup('ADMIN', 'ORDER')).toBe(true);
        expect(isRoleInPermissionGroup('ADMIN', 'USER')).toBe(false);
        expect(isRoleInPermissionGroup('STAFF', 'ORDER')).toBe(false);
        expect(isRoleInPermissionGroup('STAFF', 'USER')).toBe(false);
        expect(isRoleInPermissionGroup('DEFAULT', 'ORDER')).toBe(false);
        expect(isRoleInPermissionGroup('DEFAULT', 'USER')).toBe(false);
    });
});
