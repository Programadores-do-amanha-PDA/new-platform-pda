import { useUserRoleStore } from "../stores/user-role";
import { usePermissionsStore } from "../stores/permissions-store/store";

/**
 * Hook to access user permissions based on their current role.
 * 
 * This hook combines the user's role from the user role store with the permissions
 * from the permissions store to provide role-based permission checks.
 * 
 * @returns Object with user permissions and permission check methods
 * 
 * @example
 * ```typescript
 * const { permissions, hasPermission, hasAnyPermission } = usePermissions();
 * 
 * if (hasPermission({ permission: 'CREATE_USER' })) {
 *   // User can create users
 * }
 * ```
 */
export const usePermissions = () => {
    const { userRole: userRoleData } = useUserRoleStore();
    const { getRolePermissions, roleHasPermission, roleHasAnyPermission, roleHasAllPermissions } = usePermissionsStore();

    const userRole = userRoleData?.role;
    const permissions = userRole ? getRolePermissions({ role: userRole }) : [];

    const hasPermission = ({ permission }: { readonly permission: string }): boolean => {
        if (!userRole) return false;
        return roleHasPermission({ role: userRole, permission });
    };

    const hasAnyPermission = ({ permissions: perms }: { readonly permissions: readonly string[] }): boolean => {
        if (!userRole) return false;
        return roleHasAnyPermission({ role: userRole, permissions: perms });
    };

    const hasAllPermissions = ({ permissions: perms }: { readonly permissions: readonly string[] }): boolean => {
        if (!userRole) return false;
        return roleHasAllPermissions({ role: userRole, permissions: perms });
    };

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
};
