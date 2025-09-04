"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomConfigT } from "@/types/classroom-configs";

const getConfigByClassroomId = async (classroomId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_configs")
      .select()
      .eq("classroom_id", classroomId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching configs by classroom ID:", error);
    return false;
  }
};

const getConfigById = async (configId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_configs")
      .select()
      .eq("id", configId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching config by ID:", error);
    return false;
  }
};

const createConfig = async (
  configData: Partial<Omit<ClassroomConfigT, "id" | "created_at">>
) => {
  try {
    const supabase = await createClient();

    if (!configData.classroom_id) {
      throw new Error("Missing required field: classroom_id");
    }

    const { data, error } = await supabase
      .from("classroom_configs")
      .insert(configData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating config:", error);
    return false;
  }
};

const updateConfigById = async (
  configId: string,
  updates: Partial<Omit<ClassroomConfigT, "id" | "created_at">>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_configs")
      .update({ ...updates })
      .eq("id", configId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating config:", error);
    return false;
  }
};

const deleteConfigById = async (configId: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_configs")
      .delete()
      .eq("id", configId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting config:", error);
    return false;
  }
};

export {
  getConfigByClassroomId,
  getConfigById,
  createConfig,
  updateConfigById,
  deleteConfigById,
};
