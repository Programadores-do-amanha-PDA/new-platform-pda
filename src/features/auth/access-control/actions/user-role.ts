"use server";

import { jwtDecode } from "jwt-decode";
import { logger } from "@/lib/logger";
import { getSupabaseClient } from "@/lib/supabase/client-manager";

import { JwtPayloadT } from "@/features/auth/shared/types/jwt";
import { Role, UserRole } from "../types";

interface InsertUserRoleWithUserIdAsyncParameters {
    userId: string;
    role: Role;
}
type InsertUserRoleWithUserIdAsyncResult = UserRole[] | null;
type GetAllUserRolesAsyncResult = UserRole[] | null;
type GetUserRoleAsyncResult = string | null;
interface UpdateUserRoleAsyncParameters {
    userId: string;
    newRole: Role;
}
type UpdateUserRoleAsyncResult = UserRole[] | null;
interface DeleteUserRoleWithUserIdAsyncParameters {
    userId: string;
}
type DeleteUserRoleWithUserIdAsyncResult = boolean;

const log = logger.child({ module: "user-role.actions" });

/**
 * Inserts a new role assignment for a specific user.
 *
 * Creates a new record in the `user_roles` table linking a user to a role.
 * This action should be used when assigning a role to a user for the first time
 * or when adding additional roles.
 *
 * @param params - Object containing the operation parameters
 * @param params.userId - The unique identifier of the user to assign the role to
 * @param params.role - The role to be assigned to the user
 *
 * @returns Promise resolving to an array of user roles after insertion, or null if an error occurs
 *
 * @throws Logs error and returns null if:
 *   - userId is not provided or is invalid
 *   - role is not provided or is invalid
 *   - Supabase client is not initialized
 *   - Database insert operation fails
 *
 * @example
 * const result = await insertUserRoleWithUserIdAsync({
 *   userId: 'user-123',
 *   role: 'admin'
 * });
 * if (result) {
 *   console.log('Role assigned:', result);
 * }
 */
export const insertUserRoleWithUserIdAsync = async ({
    userId,
    role,
}: InsertUserRoleWithUserIdAsyncParameters): Promise<InsertUserRoleWithUserIdAsyncResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");
        if (!role) throw new Error("Invalid role");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("user_roles").insert({ user_id: userId, role: role }).select();
        if (error) throw error;
        if (!data) {
            throw new Error(
                "No data returned after inserting user role. This may indicate a database constraint violation or trigger issue.",
            );
        }

        log.info({ userId, role }, "User role inserted successfully");

        return data;
    } catch (error) {
        log.error({ err: error, userId, role, operation: "insertUserRoleWithUserIdAsync" }, "Failed to insert user role");

        return null;
    }
};

/**
 * Retrieves all user role assignments from the system.
 *
 * Fetches a complete list of all user-role associations from the `user_roles` table.
 * This is useful for administrative purposes, auditing, or generating reports
 * about role distribution across users.
 *
 * @returns Promise resolving to an array of all user role records, or null if an error occurs
 *
 * @throws Logs error and returns null if:
 *   - Supabase client is not initialized
 *   - Database query fails
 *
 * @example
 * const allRoles = await getAllUserRolesAsync();
 * if (allRoles) {
 *   console.log(`Total role assignments: ${allRoles.length}`);
 * }
 */
export const getAllUserRolesAsync = async (): Promise<GetAllUserRolesAsyncResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("user_roles").select();
        if (error) throw error;
        if (!data) throw new Error("Database query for user roles returned no data. Expected an array, even if empty.");

        return data;
    } catch (error) {
        log.error({ err: error, operation: "getAllUserRolesAsync" }, "Failed to fetch all user roles");

        return null;
    }
};

/**
 * Retrieves the current user's role from their active session.
 *
 * Extracts the user's role from the JWT (JSON Web Token) of the currently active session.
 * This function is typically used to determine the logged-in user's permissions
 * and control UI/feature access based on their role.
 *
 * @returns Promise resolving to the user's role as a string, or null if an error occurs
 *
 * @throws Logs error and returns null if:
 *   - Supabase client is not initialized
 *   - No active session exists
 *   - JWT decoding fails
 *   - User role claim is missing from JWT token
 *   - Session retrieval fails
 *
 * @example
 * const userRole = await getUserRoleAsync();
 * if (userRole === 'admin') {
 *   // Show admin features
 * }
 */
export const getUserRoleAsync = async (): Promise<GetUserRoleAsyncResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data || !data?.session) throw new Error("No active session");

        // Decode the JWT to extract user role
        const jwt = jwtDecode<JwtPayloadT>(data.session.access_token);
        if (!jwt.user_role) throw new Error("User role not found in JWT");
        const userRole = jwt.user_role;

        return userRole;
    } catch (error) {
        log.error({ err: error, operation: "getUserRoleAsync" }, "Failed to get user role from session");

        return null;
    }
};

/**
 * Updates a user's role assignment to a new role.
 *
 * Modifies the role associated with a specific user in the `user_roles` table.
 * Use this function when you need to change a user's access level or permissions
 * by assigning them a different role.
 *
 * @param params - Object containing the operation parameters
 * @param params.userId - The unique identifier of the user whose role should be updated
 * @param params.newRole - The new role to assign to the user
 *
 * @returns Promise resolving to an array of updated user roles, or null if an error occurs
 *
 * @throws Logs error and returns null if:
 *   - userId is not provided or is invalid
 *   - newRole is not provided or is invalid
 *   - Supabase client is not initialized
 *   - Database update operation fails
 *   - User role record is not found
 *
 * @example
 * const result = await updateUserRoleWithUserIdAsync({
 *   userId: 'user-123',
 *   newRole: 'moderator'
 * });
 * if (result) {
 *   console.log('Role updated successfully');
 * }
 */
export const updateUserRoleWithUserIdAsync = async ({
    userId,
    newRole,
}: UpdateUserRoleAsyncParameters): Promise<UpdateUserRoleAsyncResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");
        if (!newRole) throw new Error("Invalid role");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId).select();
        if (error) throw error;
        if (!data || data.length === 0) {
            throw new Error(
                `No user role found to update for userId "${userId}". The user may not have an existing role assignment.`,
            );
        }

        log.info({ userId, newRole }, "User role updated successfully");

        return data;
    } catch (error) {
        log.error({ err: error, userId, newRole, operation: "updateUserRoleWithUserIdAsync" }, "Failed to update user role");

        return null;
    }
};

/**
 * Removes all role assignments for a specific user.
 *
 * Deletes the role record(s) associated with a user from the `user_roles` table.
 * This effectively revokes all roles from the user, which typically restricts
 * their access to protected features and functionality.
 *
 * @param params - Object containing the operation parameters
 * @param params.userId - The unique identifier of the user whose roles should be deleted
 *
 * @returns Promise resolving to true if deletion was successful, false if an error occurs
 *
 * @throws Logs error and returns false if:
 *   - userId is not provided or is invalid
 *   - Supabase client is not initialized
 *   - Database delete operation fails
 *   - User record is not found
 *
 * @example
 * const success = await deleteUserRoleWithUserIdAsync({ userId: 'user-123' });
 * if (success) {
 *   console.log('User roles removed successfully');
 * }
 */
export const deleteUserRoleWithUserIdAsync = async ({
    userId,
}: DeleteUserRoleWithUserIdAsyncParameters): Promise<DeleteUserRoleWithUserIdAsyncResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
        if (error) throw error;

        log.info({ userId }, "User role deleted successfully");

        return true;
    } catch (error) {
        log.error({ err: error, userId, operation: "deleteUserRoleWithUserIdAsync" }, "Failed to delete user role");

        return false;
    }
};
