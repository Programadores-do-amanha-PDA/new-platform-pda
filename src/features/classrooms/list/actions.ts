"use server";
import { Classroom } from "../types";
import { logger } from "@/lib/logger";
import { getSupabaseClient } from "@/lib/supabase";

const log = logger.child({ module: "classrooms.list.actions" });

export const createClassroomAsync = async (classroomData: Partial<Classroom>) => {
    try {
        if (!classroomData.name || !classroomData.period || !classroomData.status || !classroomData.icon) {
            throw new Error("Missing required fields to create classroom");
        }

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Failed to create Supabase client");

        const { data, error } = await supabase.from("classrooms").insert([classroomData]).select().maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Failed to create classroom");

        return data as Classroom;
    } catch (error) {
        log.error({ err: error, classroomData, operation: "createClassroomAsync" }, "Error creating classroom");
        return null;
    }
};

export const getAllClassroomsAsync = async () => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Failed to create Supabase client");

        const { data, error } = await supabase.from("classrooms").select("*").order("created_at", { ascending: true });
        if (error) throw error;

        return data as Classroom[];
    } catch (error) {
        log.error({ err: error, operation: "getAllClassroomsAsync" }, "Error fetching all classrooms");
        return false;
    }
};

export const getClassroomsByIdAsync = async (id: string) => {
    try {
        if (!id) throw new Error("Classroom ID is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Failed to create Supabase client");

        const { data, error } = await supabase.from("classrooms").select().eq("id", id).single();
        if (error) throw error;
        if (!data) throw new Error("Classroom not found");

        return data as Classroom;
    } catch (error) {
        log.error({ err: error, id, operation: "getClassroomsByIdAsync" }, "Error fetching classroom by ID");
        return false;
    }
};

export const updateClassroomAsync = async (id: string, classroomData: Partial<Classroom>) => {
    try {
        if (!id) throw new Error("Classroom ID is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Failed to create Supabase client");

        // Add updated_at timestamp
        const updatedData = {
            ...classroomData,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase.from("classrooms").update(updatedData).eq("id", id).select();

        if (error) throw error;

        return data[0] as Classroom;
    } catch (error) {
        log.error({ err: error, id, classroomData, operation: "updateClassroomAsync" }, "Error updating classroom");
        return false;
    }
};

export const deleteClassroomAsync = async (id: string) => {
    try {
        if (!id) throw new Error("Classroom ID is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Failed to create Supabase client");

        const { error } = await supabase.from("classrooms").delete().eq("id", id);
        if (error) throw error;

        return true;
    } catch (error) {
        log.error({ err: error, id, operation: "deleteClassroomAsync" }, "Error deleting classroom");
        return false;
    }
};
