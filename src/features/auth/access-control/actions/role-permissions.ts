"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { RolePermission, Role, Permission } from "../types";

const log = logger.child({ module: "rolePermissions" });

type GetAllRolePermissionsResult = RolePermission[] | null;

type GetPermissionsByRoleProps = { role: Role };
type GetPermissionsByRoleResult = Permission[] | null;

type InsertRolePermissionProps = {
    readonly role: Role;
    readonly permission: string;
};
type InsertRolePermissionResult = RolePermission | null;

type DeleteRolePermissionProps = {
    readonly role: Role;
    readonly permission: string;
};
type DeleteRolePermissionResult = boolean;

type DeleteAllPermissionsForRoleResult = boolean;

/**
 * Fetches all role permissions from the system.
 * @returns Array of role permissions or null in case of error.
 */
export const getAllRolePermissions = async (): Promise<GetAllRolePermissionsResult> => {
    try {
        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("role_permissions").select("*").order("role", { ascending: true });

        if (error) throw error;

        return data as RolePermission[];
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, operation: "getAllRolePermissions" }, "Error on get all role permissions");
        }
        return null;
    }
};

/**
 * Fetches all permissions for a specific role.
 * @param role Role to fetch permissions for.
 * @returns Array of permissions or null in case of error.
 */
export const getPermissionsByRole = async ({ role }: GetPermissionsByRoleProps): Promise<GetPermissionsByRoleResult> => {
    try {
        if (!role) throw new Error("role is required");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("role_permissions")
            .select("permission")
            .eq("role", role)
            .order("permission", { ascending: true });

        if (error) throw error;

        return data.map((item) => item.permission) as Permission[];
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, role, operation: "getPermissionsByRole" }, "Error on get permissions by role");
        }
        return null;
    }
};

/**
 * Inserts a new permission for a specific role.
 * @param role Role to add the permission to.
 * @param permission Permission to be added.
 * @returns Created role permission or null in case of error.
 */
export const insertRolePermission = async ({ role, permission }: InsertRolePermissionProps): Promise<InsertRolePermissionResult> => {
    try {
        if (!role || !permission) {
            throw new Error("role and permission are required");
        }

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("role_permissions").insert({ role, permission }).select().single();

        if (error) throw error;
        if (!data) throw new Error("No data returned from insertRolePermission");

        log.info({ role, permission, operation: "insertRolePermission" }, "Role permission created successfully");
        return data as RolePermission;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, role, permission, operation: "insertRolePermission" }, "Error on insert role permission");
        }
        return null;
    }
};

/**
 * Removes a specific permission from a role.
 * @param role Role to remove the permission from.
 * @param permission Permission to be removed.
 * @returns true if removed successfully, false otherwise.
 */
export const deleteRolePermission = async ({ role, permission }: DeleteRolePermissionProps): Promise<DeleteRolePermissionResult> => {
    try {
        if (!role || !permission) {
            throw new Error("role and permission are required");
        }

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase.from("role_permissions").delete().eq("role", role).eq("permission", permission);

        if (error) throw error;

        log.info({ role, permission, operation: "deleteRolePermission" }, "Role permission deleted successfully");
        return true;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, role, permission, operation: "deleteRolePermission" }, "Error on delete role permission");
        }
        return false;
    }
};

/**
 * Removes all permissions from a specific role.
 * @param role Role to remove all permissions from.
 * @returns true if removed successfully, false otherwise.
 */
export const deleteAllPermissionsForRole = async ({ role }: { role: Role }): Promise<DeleteAllPermissionsForRoleResult> => {
    try {
        if (!role) {
            throw new Error("role is required");
        }

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase.from("role_permissions").delete().eq("role", role);

        if (error) throw error;

        log.info({ role, operation: "deleteAllPermissionsForRole" }, "All permissions for role deleted successfully");
        return true;
    } catch (error) {
        if (error instanceof Error) {
            log.error(
                { err: error, role, operation: "deleteAllPermissionsForRole" },
                "Error on delete all permissions for role",
            );
        }
        return false;
    }
};
