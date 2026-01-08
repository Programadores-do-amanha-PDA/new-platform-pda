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

const log = logger.child({ module: "profiles.actions" });

/**
 * Fetch all profiles, optionally filtered by role.
 *
 * @param props - Configuration object with optional role filter.
 * @returns Array of profiles or null if operation fails.
 *
 * @example
 * // Get all profiles
 * const profiles = await getAllProfiles();
 *
 * @example
 * // Get profiles filtered by role
 * const adminProfiles = await getAllProfiles({ role: 'admin' });
 */
export const getAllProfiles = async ({
    role,
}: GetAllProfilesProps = {}): Promise<GetAllProfilesResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        let query = supabase.from("profiles").select("*, user_role: user_roles(id, role), enrollments:user_classrooms(*)");

        if (role) {
            query = query.eq("user_roles.role", role);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data as Profile[];
    } catch (error) {
        log.error(
            { err: error, role, operation: "getAllProfiles" },
            role ? "Failed to fetch profiles filtered by role" : "Failed to fetch all profiles"
        );
        return null;
    }
};

export const getProfileById = async ({ id }: GetProfileByIdProps): Promise<GetProfileByIdResult> => {
    try {
        if (!id) throw new Error("Invalid profile id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, bio, created_at, updated_at, user_role: user_roles(id, role), enrollments:user_classrooms(short_id, classroom_id, mode)")
            .eq("id", id)
            .single();

        if (error) throw error;

        return data as unknown as Profile;
    } catch (error) {
        log.error({ err: error, profileId: id, operation: "getProfileById" }, "Failed to fetch profile by ID");
        return null;
    }
};

export const createProfile = async ({ profileData }: CreateProfileProps): Promise<CreateProfileResult> => {
    try {
        if (!profileData) throw new Error("Invalid profile data");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("profiles").insert([profileData]).select();

        if (error) throw error;

        log.info({ profileId: data[0]?.id }, "Profile created successfully");
        return data[0];
    } catch (error) {
        log.error({ err: error, operation: "createProfile" }, "Failed to create profile");
        return null;
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

        log.info({ profileId: id }, "Profile updated successfully");
        return data[0];
    } catch (error) {
        log.error({ err: error, profileId: id, operation: "updateProfile" }, "Failed to update profile");
        return null;
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
        return true;
    } catch (error) {
        log.error({ err: error, profileId: id, operation: "deleteProfile" }, "Failed to delete profile");
        return false;
    }
};
