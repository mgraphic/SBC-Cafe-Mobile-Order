import {
    UserPermission,
    UserPermissionGroup,
    UserRole,
    rbacPermissionGroups,
    rbacPermissions,
    rbacRoleHiarchyMap,
    rbacRolePermissionGroupAllowances,
} from './user.model';

/**
 * @description Compares two user roles based on their hierarchy.
 *
 * @param userRole User role
 * @param comparedRole Lookup role to compare
 * @returns -1 | 0 | 1 indicating the comparison result:
 */
export function roleCompare(
    userRole: UserRole,
    comparedRole: UserRole
): -1 | 0 | 1 {
    const user = rbacRoleHiarchyMap[userRole];
    const compared = rbacRoleHiarchyMap[comparedRole];

    if (user < compared) {
        return -1;
    }

    if (user > compared) {
        return 1;
    }

    return 0;
}

/**
 * @description Returns the permission group from a given permission.
 *
 * @param permission User permission
 * @returns UserPermissionGroup | undefined
 */
export function getUserPermissionGroupFromPermission(
    permission: UserPermission
): UserPermissionGroup | undefined {
    const parts = permission.split('_');

    if (parts.length > 1) {
        const group = parts[0] as UserPermissionGroup;

        if (rbacPermissionGroups.includes(group)) {
            return group;
        }
    }

    return undefined;
}

/**
 * @description Checks if a given permission is a permission group.
 *
 * @param permission User permission or UserPermissionGroup
 * @returns boolean indicating if the permission is a group
 */
export function isPermissionGroup(
    permission: UserPermission | UserPermissionGroup
): permission is UserPermissionGroup {
    return (
        typeof permission === 'string' &&
        rbacPermissionGroups.includes(permission as UserPermissionGroup)
    );
}

/**
 * @description Checks if a given permission is a specific permission.
 *
 * @param permission User permission or UserPermissionGroup
 * @returns boolean indicating if the permission is a specific permission
 */
export function isPermission(
    permission: UserPermission | UserPermissionGroup
): permission is UserPermission {
    return (
        typeof permission === 'string' &&
        Object.keys(rbacPermissions).includes(permission as UserPermission)
    );
}

/**
 * @description Checks if a role has access to a permission group.
 *
 * @param role User role
 * @param permissionGroup UserPermissionGroup
 * @returns boolean indicating if the role is in the permission group
 */
export function isRoleInPermissionGroup(
    role: UserRole,
    permissionGroup: UserPermissionGroup
): boolean {
    return rbacRolePermissionGroupAllowances[role].includes(permissionGroup);
}
