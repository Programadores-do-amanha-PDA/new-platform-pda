"use server";

import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { logger } from "@/lib/logger";

import type {
    CreateProfileProps,
    CreateProfileResult,
    DeleteProfileProps,
    DeleteProfileResult,
    GetAllProfilesProps,
    GetAllProfilesResult,
    GetProfileByIdProps,
    GetProfileByIdResult,
    Profile,
    UpdateProfileProps,
    UpdateProfileResult,
} from "./types";
import { AuthError } from "@supabase/supabase-js";

const log = logger.child({ module: "ProfileActions" });

export const getAllProfiles = async ({ role }: GetAllProfilesProps = {}): Promise<GetAllProfilesResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        let query = supabase.from("profiles").select("*");

        if (role) {
            query = query.eq("user_roles.role", role);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (!data) throw new Error("No profiles data returned");

        return { data: { profiles: data as Profile[] }, error: null };
    } catch (error) {
        log.error(
            { err: error, role, operation: "getAllProfiles" },
            role ? "Failed to fetch profiles filtered by role" : "Failed to fetch all profiles",
        );

        return {
            data: null,
            error: error instanceof Error || error instanceof AuthError ? error.message : "unknown error",
        };
    }
};

export const getProfileById = async ({ id }: GetProfileByIdProps): Promise<GetProfileByIdResult> => {
    try {
        if (!id) throw new Error("Invalid profile id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, bio, avatar_url, created_at, updated_at")
            .eq("id", id)
            .single();
        if (error) throw error;
        if (!data) throw new Error("No profile data returned");

        return { data: { profile: data as Profile }, error: null };
    } catch (error) {
        log.error({ err: error, profileId: id, operation: "getProfileById" }, "Failed to fetch profile by ID");
        return { data: null, error: error instanceof Error || error instanceof AuthError ? error.message : "unknown error" };
    }
};

export const createProfile = async ({ profileData }: CreateProfileProps): Promise<CreateProfileResult> => {
    try {
        if (!profileData) throw new Error("Invalid profile data");
        if (!profileData.full_name) throw new Error("Profile full_name is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("profiles").insert([profileData]).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No profile data returned after creation");

        log.info({ profileId: data[0]?.id }, "Profile created successfully");
        return { data: { profile: data[0] }, error: null };
    } catch (error) {
        log.error({ err: error, operation: "createProfile" }, "Failed to create profile");
        return {
            data: null,
            error: error instanceof Error || error instanceof AuthError ? error : new Error("unknown error"),
        };
    }
};

export const updateProfile = async ({ id, updates }: UpdateProfileProps): Promise<UpdateProfileResult> => {
    try {
        if (!id) throw new Error("Invalid profile id");
        if (!updates) throw new Error("Invalid update data");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No profile data returned after update");

        log.info({ profileId: id }, "Profile updated successfully");
        return {
            data: { profile: data[0] },
            error: null,
        };
    } catch (error) {
        log.error({ err: error, profileId: id, operation: "updateProfile" }, "Failed to update profile");
        return {
            data: null,
            error: error instanceof Error || error instanceof AuthError ? error : new Error("unknown error"),
        };
    }
};

export const deleteProfile = async ({ id }: DeleteProfileProps): Promise<DeleteProfileResult> => {
    try {
        if (!id) throw new Error("Invalid profile id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error) throw error;

        log.info({ profileId: id }, "Profile deleted successfully");
        return { data: { deletedUserId: id }, error: null };
    } catch (error) {
        log.error({ err: error, profileId: id, operation: "deleteProfile" }, "Failed to delete profile");
        return { data: null, error: error instanceof Error || error instanceof AuthError ? error : new Error("unknown error") };
    }
};
