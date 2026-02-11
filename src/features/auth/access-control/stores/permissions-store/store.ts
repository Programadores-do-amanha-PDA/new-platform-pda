import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
import { Role, Permission, RolesLabels } from "../../types";
import { PermissionsState, PermissionsActions } from "./types";
import { getAllRolePermissionsAsync, getPermissionsByRoleAsync, insertRolePermissionAsync, deleteRolePermission, deleteAllPermissionsForRoleAsync } from "../../actions/role-permissions";

const log = logger.child({ module: "PermissionsStore" });

const initialState: PermissionsState = {
    allRolePermissions: [],
    rolePermissions: {} as Record<Role, Permission[]>,
    loading: false,
    operationLoading: false,
};

/**
 * Permissions store for managing role-based access control.
 *
 * This store handles fetching, managing, and checking permissions across different user roles.
 * It provides methods to retrieve permissions, add/remove permissions from roles, and validate
 * role-permission relationships.
 *
 * @returns {PermissionsState & PermissionsActions} The permissions store with state and actions
 *
 * @example
 * ```typescript
 * const { fetchAllRolePermissions, roleHasPermission } = usePermissionsStore();
 *
 * // Fetch all permissions
 * await fetchAllRolePermissions();
 *
 * // Check if a role has a permission
 * const hasPermission = roleHasPermission({ role: 'ADMIN', permission: 'CREATE_USER' });
 * ```
 *
 * @remarks
 * - Loading states are managed via `loading` for fetch operations and `operationLoading` for mutations
 * - User feedback is provided through toast notifications
 * - All async operations include error logging and graceful error handling
 * - State updates are atomic and prevent race conditions using Zustand's `set` function
 */
export const usePermissionsStore = create<PermissionsState & PermissionsActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            /**
             * Fetches all role permissions.
             * @returns true if successful, false otherwise.
             */
            fetchAllRolePermissions: async () => {
                try {
                    set({ loading: true });

                    const allRolePermissions = await getAllRolePermissionsAsync();
                    if (!allRolePermissions) throw new Error("no get all role permissions response");

                    set({ allRolePermissions });
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, operation: "fetchAllRolePermissions" }, "Error fetching all role permissions");
                    }
                    toast.error("Falha ao buscar permissões de todos os cargos.");
                    set({ allRolePermissions: [] });
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            /**
             * Fetches permissions for a specific role.
             * @param role Role to fetch permissions for.
             * @returns true if successful, false otherwise.
             */
            fetchPermissionsForRole: async ({ role }) => {
                try {
                    if (!role) {
                        throw new Error("role is required");
                    }

                    set({ loading: true });

                    const permissions = await getPermissionsByRoleAsync({ role });
                    if (!permissions) throw new Error("no get permissions by role response");

                    set((state) => ({
                        rolePermissions: {
                            ...state.rolePermissions,
                            [role]: permissions,
                        },
                    }));

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn(
                            { err: error, role, operation: "fetchPermissionsForRole" },
                            "Error fetching permissions for role",
                        );
                    }
                    toast.error(`Falha ao buscar permissões para o cargo ${role}.`);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            /**
             * Fetches permissions for all roles.
             * @returns true if successful, false otherwise.
             */
            fetchPermissionsForAllRoles: async () => {
                try {
                    set({ loading: true });

                    const roles = [
                        RolesLabels.ADMIN,
                        RolesLabels.EMPLOYER,
                        RolesLabels.CLASS_MANAGER,
                        RolesLabels.TEACHER,
                        RolesLabels.STUDENT,
                        RolesLabels.ALUMNI,
                    ] as const;
                    const rolePermissionsPromises = roles.map(async (role) => {
                        const permissions = await getPermissionsByRoleAsync({ role });
                        return { role, permissions: permissions || [] };
                    });

                    const results = await Promise.all(rolePermissionsPromises);
                    const rolePermissions = results.reduce(
                        (acc, { role, permissions }) => {
                            acc[role] = permissions || [];
                            return acc;
                        },
                        {} as Record<Role, Permission[]>,
                    );

                    set({ rolePermissions });
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn(
                            { err: error, operation: "fetchPermissionsForAllRoles" },
                            "Error fetching permissions for all roles",
                        );
                    }
                    toast.error("Falha ao buscar permissões para todos os cargos.");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            /**
             * Adds a permission to a role.
             * @param role Role to add permission to.
             * @param permission Permission to be added.
             * @returns true if successful, false otherwise.
             */
            addPermissionToRole: async ({ role, permission }) => {
                try {
                    if (!role || !permission) {
                        throw new Error("role and permission are required");
                    }

                    set({ operationLoading: true });

                    const result = await insertRolePermissionAsync({ role, permission });
                    if (!result) throw new Error("no insert role permission response");

                    // Update local state
                    set((state) => ({
                        rolePermissions: {
                            ...state.rolePermissions,
                            [role]: [...(state.rolePermissions[role] || []), permission],
                        },
                    }));

                    toast.success("Permissão adicionada ao cargo com sucesso.");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, role, permission, operation: "addPermissionToRole" },
                            "Error adding permission to role",
                        );
                    }
                    toast.error("Falha ao adicionar permissão ao cargo.");
                    return false;
                } finally {
                    set({ operationLoading: false });
                }
            },

            /**
             * Removes a permission from a role.
             * @param role Role to remove permission from.
             * @param permission Permission to be removed.
             * @returns true if successful, false otherwise.
             */
            removePermissionFromRole: async ({ role, permission }) => {
                try {
                    if (!role || !permission) {
                        throw new Error("role and permission are required");
                    }

                    set({ operationLoading: true });

                    const result = await deleteRolePermission({ role, permission });
                    if (!result) throw new Error("no delete role permission response");

                    // Update local state
                    set((state) => ({
                        rolePermissions: {
                            ...state.rolePermissions,
                            [role]: (state.rolePermissions[role] || []).filter((p) => p !== permission),
                        },
                    }));

                    toast.success("Permissão removida do cargo com sucesso.");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, role, permission, operation: "removePermissionFromRole" },
                            "Error removing permission from role",
                        );
                    }
                    toast.error("Falha ao remover permissão do cargo.");
                    return false;
                } finally {
                    set({ operationLoading: false });
                }
            },

            /**
             * Removes all permissions from a role.
             * @param role Role to remove all permissions from.
             * @returns true if successful, false otherwise.
             */
            removeAllPermissionsFromRole: async ({ role }) => {
                try {
                    if (!role) {
                        throw new Error("role is required");
                    }

                    set({ operationLoading: true });

                    const result = await deleteAllPermissionsForRoleAsync({ role });
                    if (!result) throw new Error("no delete all permissions for role response");

                    // Update local state
                    set((state) => ({
                        rolePermissions: {
                            ...state.rolePermissions,
                            [role]: [],
                        },
                    }));

                    toast.success("Todas as permissões removidas do cargo com sucesso.");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, role, operation: "removeAllPermissionsFromRole" },
                            "Error removing all permissions from role",
                        );
                    }
                    toast.error("Falha ao remover todas as permissões do cargo.");
                    return false;
                } finally {
                    set({ operationLoading: false });
                }
            },

            /**
             * Gets the permissions for a role.
             * @param role Role to get permissions for.
             * @returns Array of role permissions.
             */
            getRolePermissions: ({ role }) => {
                const { rolePermissions } = get();
                return rolePermissions[role] || [];
            },

            /**
             * Checks if a role has a specific permission.
             * @param role Role to check.
             * @param permission Permission to check.
             * @returns true if the role has the permission, false otherwise.
             */
            roleHasPermission: ({ role, permission }) => {
                const { rolePermissions } = get();
                const permissions = rolePermissions[role] || [];
                return permissions.includes(permission);
            },

            /**
             * Checks if a role has at least one of the specified permissions.
             * @param role Role to check.
             * @param permissions Array of permissions to check.
             * @returns true if the role has at least one permission, false otherwise.
             */
            roleHasAnyPermission: ({ role, permissions }) => {
                const { rolePermissions } = get();
                const rolePerms = rolePermissions[role] || [];
                return permissions.some((permission) => rolePerms.includes(permission));
            },

            /**
             * Checks if a role has all the specified permissions.
             * @param role Role to check.
             * @param permissions Array of permissions to check.
             * @returns true if the role has all permissions, false otherwise.
             */
            roleHasAllPermissions: ({ role, permissions }) => {
                const { rolePermissions } = get();
                const rolePerms = rolePermissions[role] || [];
                return permissions.every((permission) => rolePerms.includes(permission));
            },

            /**
             * Resets the store state.
             */
            reset: () => {
                set(initialState);
            },
        }),
        { name: "PermissionsStore" },
    ),
);
