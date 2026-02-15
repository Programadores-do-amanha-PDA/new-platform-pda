"use server";

import { logger } from "@/lib/logger";
import { getSupabaseClient } from "@/lib/supabase";
import { RolePermission, Role, Permission } from "../types";
import { serializeError } from "../../shared/utils";

type GetAllRolePermissionsAsyncResult = RolePermission[] | null;
interface GetPermissionsByRoleAsyncProps {
    role: Role;
}
type GetPermissionsByRoleAsyncResult = Permission[] | null;
interface InsertRolePermissionAsyncProps {
    readonly role: Role;
    readonly permission: string;
}
type InsertRolePermissionAsyncResult = RolePermission | null;
interface DeleteRolePermissionProps {
    readonly role: Role;
    readonly permission: string;
}
type DeleteRolePermissionResult = boolean;
type DeleteAllPermissionsForRoleAsyncResult = boolean;

const log = logger.child({ module: "rolePermissions" });

/**
 * Fetches all role permissions from the system.
 *
 * Retrieves a complete list of all role-permission associations from the `role_permissions` table.
 * This is useful for administrative purposes, building permission matrices, and system audits.
 *
 * @returns Promise resolving to an array of all role permission records, or null if an error occurs
 *
 * @throws Logs error and returns null if:
 *   - Supabase client is not initialized
 *   - Database query fails
 *
 * @example
 * const allPermissions = await getAllRolePermissionsAsync();
 * if (allPermissions) {
 *   console.log(`Total mappings: ${allPermissions.length}`);
 * }
 */
export const getAllRolePermissionsAsync = async (): Promise<GetAllRolePermissionsAsyncResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("role_permissions").select("*").order("role", { ascending: true });
        if (error) throw error;
        if (!data) throw new Error("Database query for role permissions returned no data. Expected at least an empty array.");

        const rolesPermissions = data as RolePermission[];

        return rolesPermissions;
    } catch (error) {
        log.error({ err: serializeError(error), operation: "getAllRolePermissionsAsync" }, "Error on get all role permissions");

        return null;
    }
};

/**
 * Fetches all permissions for a specific role.
 *
 * Retrieves the complete set of permissions granted to a particular role.
 * Use this to determine what actions are allowed for users with a given role.
 *
 * @param params - Object containing the operation parameters
 * @param params.role - The role to fetch permissions for
 *
 * @returns Promise resolving to an array of permissions for the role, or null if an error occurs
 *
 * @throws Logs error and returns null if:
 *   - role is not provided
 *   - Supabase client is not initialized
 *   - Database query fails
 *
 * @example
 * const permissions = await getPermissionsByRoleAsync({ role: 'admin' });
 * if (permissions) {
 *   console.log('Admin permissions:', permissions);
 * }
 */
export const getPermissionsByRoleAsync = async ({
    role,
}: GetPermissionsByRoleAsyncProps): Promise<GetPermissionsByRoleAsyncResult> => {
    try {
        if (!role) throw new Error("role is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("role_permissions")
            .select("permission")
            .eq("role", role)
            .order("permission", { ascending: true });
        if (error) throw error;
        if (!data) {
            throw new Error(
                "Database query for permissions by role returned no data. Expected at least an empty array for role: " + role,
            );
        }

        const permissions = data.map((item) => item.permission) as Permission[];

        return permissions;
    } catch (error) {
        log.error({ err: serializeError(error), role, operation: "getPermissionsByRoleAsync" }, "Error on get permissions by role");

        return null;
    }
};

/**
 * Inserts a new permission for a specific role.
 *
 * Creates a new role-permission association in the `role_permissions` table.
 * Use this to grant a new permission to a role in your permission management system.
 *
 * @param params - Object containing the operation parameters
 * @param params.role - The role to add the permission to
 * @param params.permission - Permission identifier to be added (e.g., 'create:posts')
 *
 * @returns Promise resolving to the created role permission record, or null if an error occurs
 *
 * @throws Logs error and returns null if:
 *   - role is not provided or is invalid
 *   - permission is not provided or is invalid
 *   - Supabase client is not initialized
 *   - Database insert fails (e.g., duplicate entry)
 *
 * @example
 * const result = await insertRolePermissionAsync({
 *   role: 'moderator',
 *   permission: 'edit:posts'
 * });
 * if (result) {
 *   console.log('Permission granted:', result);
 * }
 */
export const insertRolePermissionAsync = async ({
    role,
    permission,
}: InsertRolePermissionAsyncProps): Promise<InsertRolePermissionAsyncResult> => {
    try {
        if (!role) throw new Error("role is required");
        if (!permission) throw new Error("permission is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("role_permissions").insert({ role, permission }).select().single();
        if (error) throw error;
        if (!data)
            throw new Error(
                "No data returned after inserting role permission. This may indicate a database constraint violation (for example, duplicate entry) or a trigger issue.",
            );

        const rolePermission = data as RolePermission;
        log.info(
            { role, permission, rolePermission, operation: "insertRolePermissionAsync" },
            "Role permission created successfully",
        );

        return rolePermission;
    } catch (error) {
        log.error({ err: error, role, permission, operation: "insertRolePermissionAsync" }, "Error on insert role permission");

        return null;
    }
};

/**
 * Deletes a specific permission from a role.
 *
 * Removes a single role-permission association from the `role_permissions` table.
 * Use this to revoke a specific permission from a role without affecting other permissions.
 *
 * @param params - Object containing the operation parameters
 * @param params.role - The role to remove the permission from
 * @param params.permission - Permission identifier to be removed
 *
 * @returns Promise resolving to true if deletion was successful, false if an error occurs
 *
 * @throws Logs error and returns false if:
 *   - role is not provided or is invalid
 *   - permission is not provided or is invalid
 *   - Supabase client is not initialized
 *   - Database delete operation fails
 *
 * @example
 * const success = await deleteRolePermission({
 *   role: 'moderator',
 *   permission: 'edit:posts'
 * });
 * if (success) {
 *   console.log('Permission revoked successfully');
 * }
 */
export const deleteRolePermission = async ({
    role,
    permission,
}: DeleteRolePermissionProps): Promise<DeleteRolePermissionResult> => {
    try {
        if (!role) throw new Error("role is required");
        if (!permission) throw new Error("permission is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase.from("role_permissions").delete().eq("role", role).eq("permission", permission);
        if (error) throw error;

        log.info({ role, permission, operation: "deleteRolePermission" }, "Role permission deleted successfully");

        return true;
    } catch (error) {
        log.error({ err: error, role, permission, operation: "deleteRolePermission" }, "Error on delete role permission");

        return false;
    }
};

/**
 * Deletes all permissions associated with a specific role.
 *
 * @param role - The role for which all permissions should be deleted.
 * @returns A promise that resolves to `true` if all permissions were successfully deleted,
 *          or `false` if an error occurred.
 *
 * @throws Will throw an error if the `role` parameter is not provided or if the Supabase client
 *         is not initialized.
 *
 * @example
 * const result = await deleteAllPermissionsForRoleAsync({ role: "admin" });
 * if (result) {
 *     console.log("All permissions for the role were deleted successfully.");
 * } else {
 *     console.error("Failed to delete permissions for the role.");
 * }
 */
export const deleteAllPermissionsForRoleAsync = async ({
    role,
}: {
    role: Role;
}): Promise<DeleteAllPermissionsForRoleAsyncResult> => {
    try {
        if (!role) throw new Error("role is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase.from("role_permissions").delete().eq("role", role);
        if (error) throw error;

        log.info({ role, operation: "deleteAllPermissionsForRoleAsync" }, "All permissions for role deleted successfully");

        return true;
    } catch (error) {
        log.error(
            { err: error, role, operation: "deleteAllPermissionsForRoleAsync" },
            "Error on delete all permissions for role",
        );

        return false;
    }
};
