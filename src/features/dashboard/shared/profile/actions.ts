"use server";

import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { logger } from "@/lib/logger";

import type {
    CreateProfileProps,
    CreateProfileResult,
    DeleteProfileProps,
    DeleteProfileResult,
    GetAllProfilesFilteredByRoleProps,
    GetAllProfilesFilteredByRoleResult,
    GetAllProfilesResult,
    GetProfileByIdProps,
    GetProfileByIdResult,
    Profile,
    UpdateProfileProps,
    UpdateProfileResult,
} from "./types";

const log = logger.child({ module: "profiles.actions" });

export const getAllProfiles = async (): Promise<GetAllProfilesResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, email, created_at, updated_at, user_roles(id, role), classrooms:user_classrooms(*)");

        if (error) throw error;

        return data as Profile[];
    } catch (error) {
        log.error({ err: error, operation: "getAllProfiles" }, "Failed to fetch all profiles");
        return null;
    }
};

export const getAllProfilesFilteredByRole = async ({
    role,
}: GetAllProfilesFilteredByRoleProps): Promise<GetAllProfilesFilteredByRoleResult> => {
    try {
        if (!role) throw new Error("Invalid role");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase
            .from("profiles")
            .select("*, user_roles!inner(id, role), classrooms:user_classrooms(*)")
            .eq("user_roles.role", role);

        if (error) throw error;

        return data as Profile[];
    } catch (error) {
        log.error({ err: error, role, operation: "getAllProfilesFilteredByRole" }, "Failed to fetch filtered profiles");
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
            .select("id, full_name, email, bio, created_at, updated_at, user_roles(id, role), classrooms:user_classrooms(*)")
            .eq("id", id)
            .single();

        if (error) throw error;

        return data as Profile;
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
