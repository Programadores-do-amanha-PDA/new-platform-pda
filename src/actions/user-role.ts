"use server";

import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { createClient } from "@/lib/supabase/server";
import { jwtDecode } from "jwt-decode";

import { logger } from "@/lib/logger";
import { JwtPayloadT } from "@/features/shared/auth";
import {
    GetAllUserRolesResult,
    InsertUserRoleProps,
    InsertUserRoleResult,
    UpdateUserRoleProps,
    UpdateUserRoleResult,
    DeleteUserRoleProps,
    DeleteUserRoleResult,
    GetUserRoleResult,
} from "@/types";

const log = logger.child({ module: "user-role.actions" });

export const getAllUserRoles = async (): Promise<GetAllUserRolesResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("user_roles").select();

        if (error) throw error;

        return data;
    } catch (error) {
        log.error({ err: error, operation: "getAllUserRoles" }, "Failed to fetch all user roles");
        return null;
    }
};

export const insertUserRoleWithUserId = async ({ userId, role }: InsertUserRoleProps): Promise<InsertUserRoleResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");
        if (!role) throw new Error("Invalid role");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("user_roles").insert({ user_id: userId, role: role }).select();

        if (error) throw error;

        log.info({ userId, role }, "User role inserted successfully");
        return data;
    } catch (error) {
        log.error({ err: error, userId, role, operation: "insertUserRoleWithUserId" }, "Failed to insert user role");
        return null;
    }
};

export const updateUserRoleWithUserId = async ({ userId, newRole }: UpdateUserRoleProps): Promise<UpdateUserRoleResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");
        if (!newRole) throw new Error("Invalid role");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId).select();

        if (error) throw error;

        log.info({ userId, newRole }, "User role updated successfully");
        return data;
    } catch (error) {
        log.error({ err: error, userId, newRole, operation: "updateUserRoleWithUserId" }, "Failed to update user role");
        return null;
    }
};

export const deleteUserRoleWithUserId = async ({ userId }: DeleteUserRoleProps): Promise<DeleteUserRoleResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);

        if (error) throw error;

        log.info({ userId }, "User role deleted successfully");
        return true;
    } catch (error) {
        log.error({ err: error, userId, operation: "deleteUserRoleWithUserId" }, "Failed to delete user role");
        return false;
    }
};

export const getUserRole = async (): Promise<GetUserRoleResult> => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;
        if (!data || !data?.session) throw new Error("No active session");

        const jwt = jwtDecode<JwtPayloadT>(data.session.access_token);
        const userRole = jwt.user_role;

        return userRole;
    } catch (error) {
        log.error({ err: error, operation: "getUserRole" }, "Failed to get user role from session");
        return null;
    }
};
