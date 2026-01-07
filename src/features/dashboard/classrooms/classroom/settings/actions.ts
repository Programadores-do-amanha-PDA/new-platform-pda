"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

import { ClassSetting } from "./types";

const log = logger.child({ module: "classroom.management.settings-actions" });

export const getSettingByClassroomId = async ({ classroomId }: { classroomId: string }): Promise<ClassSetting[] | null> => {
    try {
        if (!classroomId) throw new Error("Missing required field: classroomId");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("classroom_configs").select().eq("classroom_id", classroomId).single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from select operation");

        return data as ClassSetting[];
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, classroomId, operation: "getSettingByClassroomId" });
        }

        return null;
    }
};

export const getSettingById = async ({ id }: { id: string }) => {
    try {
        if (!id) throw new Error("Missing required field: id");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("classroom_configs").select().eq("id", id).single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from select operation");

        return data as ClassSetting;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, id, operation: "getSettingById" });
        }

        return null;
    }
};

export const createSetting = async ({
    settingData,
}: {
    settingData: Partial<Omit<ClassSetting, "id" | "created_at">>;
}): Promise<ClassSetting | null> => {
    try {
        if (!settingData.classroom_id) {
            throw new Error("Missing required field: classroom_id");
        }

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("classroom_configs").insert(settingData).select().single();
        if (error) throw error;
        if (!data) throw new Error("No data returned from insert operation");

        log.info({ settingData, operation: "createSetting" }, "ClassSetting created successfully");

        return data as ClassSetting;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, settingData, operation: "createSetting" });
        }

        return null;
    }
};

export const updateSettingById = async ({
    id,
    updates,
}: {
    id: string;
    updates: Partial<Omit<ClassSetting, "id" | "created_at">>;
}): Promise<ClassSetting | null> => {
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

        log.info({ settingId: id, updates, operation: "updateSettingById" }, "ClassSetting updated successfully");

        return data as ClassSetting;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, id, updates, operation: "updateSettingById" });
        }
        return null;
    }
};

export const deleteSettingById = async ({ id }: { id: string }): Promise<boolean> => {
    try {
        if (!id) throw new Error("Missing required field: id");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase.from("classroom_configs").delete().eq("id", id);
        if (error) throw error;

        return true;
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, id, operation: "deleteSettingById" });
        }
        return false;
    }
};
