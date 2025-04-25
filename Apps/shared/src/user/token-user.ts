import {
    getUserPermissionGroupFromPermission,
    isPermission,
    isPermissionGroup,
    isRoleInPermissionGroup,
    roleCompare,
} from './user.utils';
import {
    JwtUserPayload,
    rbacRolePermissionGroupAllowances,
    UserPermission,
    UserPermissionGroup,
    UserRole,
} from './user.model';

export class TokenUser {
    public constructor(private user: JwtUserPayload) {}

    public hasRole(role: UserRole): boolean {
        if (!this.user.role) {
            return false;
        }

        return roleCompare(this.user.role, role) >= 0;
    }

    public hasPermission(
        permission: UserPermissionGroup | UserPermission
    ): boolean {
        if (!this.user.permissions || !this.user.role) {
            return false;
        }

        if (isPermission(permission)) {
            // permission is type of UserPermission
            const permissionGroup =
                getUserPermissionGroupFromPermission(permission);

            if (permissionGroup) {
                if (
                    isRoleInPermissionGroup(
                        this.user.role,
                        permissionGroup as UserPermissionGroup
                    )
                ) {
                    return true;
                }
            }

            if (
                rbacRolePermissionGroupAllowances[this.user.role].includes(
                    permission
                )
            ) {
                return true;
            }

            return this.user.permissions.includes(permission);
        }

        if (isPermissionGroup(permission)) {
            // permission is type of UserPermissionGroup
            return isRoleInPermissionGroup(
                this.user.role,
                permission as UserPermissionGroup
            );
        }

        return false;
    }

    public getUserData(): JwtUserPayload {
        return this.user;
    }

    public getUserName(): string {
        return this.user.email;
    }

    public getUserId(): string {
        return this.user.id;
    }
}
