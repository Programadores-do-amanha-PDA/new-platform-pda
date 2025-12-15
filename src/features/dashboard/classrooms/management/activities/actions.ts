"use server";

import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { Activity } from "./types";
import { logger } from "@/lib/logger";
import {
    GetAllActivitiesByClassroomIdProps,
    GetAllActivitiesByClassroomIdResult,
    GetActivityByIdProps,
    GetActivityByIdResult,
    CreateActivityProps,
    CreateActivityResult,
    UpdateActivityByIdProps,
    UpdateActivityByIdResult,
    CreateMultipleActivitiesProps,
    CreateMultipleActivitiesResult,
    DeleteActivityByIdProps,
    DeleteActivityByIdResult,
} from "./types/activities-actions.types";

const log = logger.child({ module: "classroom.activity-actions" });

export const getAllActivitiesByClassroomId = async ({
    classroomId,
}: GetAllActivitiesByClassroomIdProps): Promise<GetAllActivitiesByClassroomIdResult> => {
    try {
        if (!classroomId) throw new Error("Invalid classroom id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase
            .from("classroom_activities")
            .select()
            .eq("classroom_id", classroomId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return data as Activity[];
    } catch (error) {
        log.error(
            { err: error, classroomId, operation: "getAllActivitiesByClassroomId" },
            "Failed to fetch activities by classroom ID",
        );
        return null;
    }
};

export const getActivityById = async ({ id }: GetActivityByIdProps): Promise<GetActivityByIdResult> => {
    try {
        if (!id) throw new Error("Invalid activity id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("classroom_activities").select().eq("id", id).single();

        if (error) throw error;

        return data as Activity;
    } catch (error) {
        log.error({ err: error, id, operation: "getActivityById" }, "Failed to fetch activity by ID");
        return null;
    }
};

export const createActivity = async ({ activityData }: CreateActivityProps): Promise<CreateActivityResult> => {
    try {
        if (!activityData) throw new Error("Invalid activity data");
        if (!activityData.classroom_id) throw new Error("Missing required field: classroom_id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("classroom_activities").insert(activityData).select().single();

        if (error) throw error;

        log.info({ activityId: data.id, classroomId: activityData.classroom_id }, "Activity created successfully");
        return data as Activity;
    } catch (error) {
        log.error({ err: error, operation: "createActivity" }, "Failed to create activity");
        return null;
    }
};

export const updateActivityById = async ({ id, updates }: UpdateActivityByIdProps): Promise<UpdateActivityByIdResult> => {
    try {
        if (!id) throw new Error("Invalid activity id");
        if (!updates) throw new Error("Invalid update data");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase
            .from("classroom_activities")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        log.info({ activityId: id }, "Activity updated successfully");
        return data as Activity;
    } catch (error) {
        log.error({ err: error, activityId: id, operation: "updateActivityById" }, "Failed to update activity");
        return null;
    }
};

export const createMultipleActivities = async ({
    activitiesData,
}: CreateMultipleActivitiesProps): Promise<CreateMultipleActivitiesResult> => {
    try {
        if (!activitiesData || activitiesData.length === 0) throw new Error("Invalid activities data");

        // Validate required fields
        for (const activityData of activitiesData) {
            if (!activityData.classroom_id) {
                throw new Error("Missing required field: classroom_id in one or more activities");
            }
        }

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("classroom_activities").insert(activitiesData).select();

        if (error) throw error;

        log.info({ activitiesCount: data.length }, "Multiple activities created successfully");
        return data as Activity[];
    } catch (error) {
        log.error({ err: error, operation: "createMultipleActivities" }, "Failed to create multiple activities");
        return null;
    }
};

export const deleteActivityById = async ({ id }: DeleteActivityByIdProps): Promise<DeleteActivityByIdResult> => {
    try {
        if (!id) throw new Error("Invalid activity id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { error } = await supabase.from("classroom_activities").delete().eq("id", id);

        if (error) throw error;

        log.info({ id }, "Activity deleted successfully");
        return true;
    } catch (error) {
        log.error({ err: error, id, operation: "deleteActivityById" }, "Failed to delete activity");
        return false;
    }
};
