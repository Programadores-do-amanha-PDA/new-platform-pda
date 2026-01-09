"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

import { ClassroomSetting } from "./types";

type GetSettingByClassroomIdProps = { classroomId: string };
type GetSettingByClassroomIdResult = ClassroomSetting | null;

type GetSettingByIdProps = { id: string };
type GetSettingByIdResult = ClassroomSetting | null;

const log = logger.child({ module: "classroom-settings-actions" });

/**
 * Retrieves the settings configuration for a specific classroom.
 * 
 * @param {Object} props - The function parameters
 * @param {string} props.classroomId - The unique identifier of the classroom
 * 
 * @returns {Promise<ClassroomSetting | null>} A promise that resolves to the classroom settings object,
 * or null if an error occurs during retrieval
 * 
 * @throws Will log errors internally but returns null instead of throwing
 * 
 * @example
 * const settings = await getSettingByClassroomId({ classroomId: "classroom-123" });
 * if (settings) {
 *   console.log(settings);
 * }
 */
export const getSettingByClassroomId = async ({
    classroomId,
}: GetSettingByClassroomIdProps): Promise<GetSettingByClassroomIdResult> => {
    try {
        if (!classroomId) throw new Error("Missing required field: classroomId");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("classroom_configs").select().eq("classroom_id", classroomId).single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from select operation");

        return data as ClassroomSetting;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, classroomId, operation: "getSettingByClassroomId" });
        }

        return null;
    }
};

/**
 * Retrieves a classroom setting configuration by its ID from the database.
 * 
 * @param {GetSettingByIdProps} props - The parameters object
 * @param {string} props.id - The unique identifier of the classroom setting to retrieve
 * 
 * @returns {Promise<GetSettingByIdResult>} A promise that resolves to the classroom setting object if found,
 * or `null` if an error occurs during the operation
 * 
 * @throws Will catch and log errors internally, returning `null` instead of throwing:
 * - If `id` is not provided
 * - If the Supabase client fails to initialize
 * - If the database query fails
 * - If no data is returned from the database
 * 
 * @example
 * const setting = await getClassroomSettingById({ id: "classroom-123" });
 * if (setting) {
 *   console.log("Setting retrieved:", setting);
 * }
 */
export const getClassroomSettingById = async ({ id }: GetSettingByIdProps): Promise<GetSettingByIdResult> => {
    try {
        if (!id) throw new Error("Missing required field: id");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("classroom_configs").select().eq("id", id).single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from select operation");

        return data as ClassroomSetting;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, id, operation: "getSettingById" });
        }

        return null;
    }
};

/**
 * Creates a new classroom setting in the database.
 * 
 * @param {Object} params - The parameters object
 * @param {Partial<Omit<ClassroomSetting, "id" | "created_at">>} params.settingData - The classroom setting data to create, excluding id and created_at fields
 * @param {string} params.settingData.classroom_id - The ID of the classroom (required)
 * 
 * @returns {Promise<ClassroomSetting | null>} The created classroom setting with all fields including id and created_at, or null if the operation fails
 * 
 * @throws {Error} Throws an error if classroom_id is missing or if the Supabase client is not initialized
 * 
 * @example
 * const newSetting = await createClassroomSetting({
 *   settingData: {
 *     classroom_id: "123",
 *     // ... other setting properties
 *   }
 * });
 */
export const createClassroomSetting = async ({
    settingData,
}: {
    settingData: Partial<Omit<ClassroomSetting, "id" | "created_at">>;
}): Promise<ClassroomSetting | null> => {
    try {
        if (!settingData.classroom_id) {
            throw new Error("Missing required field: classroom_id");
        }

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("classroom_configs").insert(settingData).select().single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from insert operation");

        log.info({ settingData, operation: "createClassroomSetting" }, "ClassroomSetting created successfully");

        return data as ClassroomSetting;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, settingData, operation: "createClassroomSetting" });
        }

        return null;
    }
};

/**
 * Updates a classroom setting by its ID with the provided partial updates.
 * 
 * @param {Object} params - The parameters object
 * @param {string} params.id - The unique identifier of the classroom setting to update
 * @param {Partial<Omit<ClassroomSetting, "id" | "created_at">>} params.updates - An object containing the fields to update (excluding id and created_at)
 * 
 * @returns {Promise<ClassroomSetting | null>} A promise that resolves to the updated ClassroomSetting object, or null if the operation fails
 * 
 * @throws {Error} Throws an error if:
 * - id or updates are missing or updates object is empty
 * - Supabase client fails to initialize
 * - The database update operation fails
 * - No data is returned from the update operation
 * 
 * @example
 * const updatedSetting = await updateClassroomSettingById({
 *   id: "classroom-123",
 *   updates: { name: "New Name", description: "New Description" }
 * });
 */
export const updateClassroomSettingById = async ({
    id,
    updates,
}: {
    id: string;
    updates: Partial<Omit<ClassroomSetting, "id" | "created_at">>;
}): Promise<ClassroomSetting | null> => {
    try {
        if (!id || !updates || Object.keys(updates).length === 0) throw new Error("Missing required fields: id and updates");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("classroom_configs")
            .update({ ...updates })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from update operation");

        log.info({ settingId: id, updates, operation: "updateClassroomSettingById" }, "ClassroomSetting updated successfully");

        return data as ClassroomSetting;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, id, updates, operation: "updateClassroomSettingById" });
        }
        return null;
    }
};

/**
 * Deletes a classroom setting configuration by its ID.
 * 
 * @param {Object} params - The parameters object
 * @param {string} params.id - The unique identifier of the classroom setting to delete
 * @returns {Promise<boolean>} Returns true if the deletion was successful, false otherwise
 * @throws {Error} Throws an error if the id is missing or if the Supabase client fails to initialize
 * 
 * @example
 * const success = await deleteClassroomSettingById({ id: "setting-123" });
 * if (success) {
 *   console.log("Classroom setting deleted successfully");
 * }
 */
export const deleteClassroomSettingById = async ({ id }: { id: string }): Promise<boolean> => {
    try {
        if (!id) throw new Error("Missing required field: id");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase.from("classroom_configs").delete().eq("id", id);
        if (error) throw error;

        return true;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, id, operation: "deleteClassroomSettingById" });
        }
        return false;
    }
};
