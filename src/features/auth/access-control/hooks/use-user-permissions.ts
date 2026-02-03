import { useUserRoleStore } from "../stores/user-role";
import { usePermissionsStore } from "../stores/permissions-store/store";
import { useCallback } from "react";

/**
 * Custom hook that provides utilities for managing and checking user permissions based on their role.
 *
 * This hook integrates with the access control system by consuming both user role information
 * from `useUserRoleStore` and permission definitions from `usePermissionsStore`. It provides
 * a convenient interface for permission checks throughout the application.
 *
 * @returns Object containing permission utilities:
 *   - `permissions`: Array of permission strings associated with the user's current role
 *   - `hasPermission`: Check if user has a specific permission
 *   - `hasAnyPermission`: Check if user has at least one of multiple permissions
 *   - `hasAllPermissions`: Check if user has all of multiple permissions
 *
 * @throws Does not throw. Returns empty permissions array and false for permission checks
 *         if user is not authenticated or user role is not found.
 *
 * @example
 * ```typescript
 * const {
 *   permissions,
 *   hasPermission,
 *   hasAnyPermission,
 *   hasAllPermissions
 * } = useUserPermissions();
 *
 * // Check single permission
 * if (hasPermission({ permission: 'edit:posts' })) {
 *   // Show edit button
 * }
 *
 * // Check if user has any of multiple permissions
 * if (hasAnyPermission({ permissions: ['view:analytics', 'export:data'] })) {
 *   // Show analytics features
 * }
 *
 * // Check if user has all required permissions
 * if (hasAllPermissions({ permissions: ['create:users', 'manage:roles'] })) {
 *   // Show admin panel
 * }
 *
 * // Access raw permissions array
 * console.log('User can:', permissions);
 * ```
 *
 * @remarks
 * - This hook is client-side only and should not be used for critical authorization
 * - Always verify permissions server-side before executing sensitive operations
 * - Permissions are derived from the user's role, not stored separately per user
 * - Results are based on current state; consider caching for performance-critical scenarios
 *
 * @see useUserRoleStore - For accessing the current user's role
 * @see usePermissionsStore - For the underlying permission storage and utilities
 */
export const useUserPermissions = () => {
    const { userRole: userRoleData } = useUserRoleStore();
    const { getRolePermissions, roleHasPermission, roleHasAnyPermission, roleHasAllPermissions } = usePermissionsStore();

    const userRole = userRoleData?.role;
    const permissions = userRole ? getRolePermissions({ role: userRole }) : [];

    const hasPermission = useCallback(
        ({ permission }: { readonly permission: string }): boolean => {
            if (!userRole) return false;
            return roleHasPermission({ role: userRole, permission });
        },
        [userRole, roleHasPermission],
    );

    const hasAnyPermission = useCallback(
        ({ permissions: perms }: { readonly permissions: readonly string[] }): boolean => {
            if (!userRole) return false;
            return roleHasAnyPermission({ role: userRole, permissions: perms });
        },
        [userRole, roleHasAnyPermission],
    );

    const hasAllPermissions = useCallback(
        ({ permissions: perms }: { readonly permissions: readonly string[] }): boolean => {
            if (!userRole) return false;
            return roleHasAllPermissions({ role: userRole, permissions: perms });
        },
        [userRole, roleHasAllPermissions],
    );

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
};
