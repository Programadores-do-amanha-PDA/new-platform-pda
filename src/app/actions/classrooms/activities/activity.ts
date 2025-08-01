"use server";
import { ClassroomActivityT } from "@/types/classroom-activities/activities";
import { createClient } from "@/lib/supabase/server";

const getAllActivitiesByClassroomId = async (classroomId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_activities")
      .select()
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching activities by classroom ID:", error);
    return false;
  }
};

const getActivityById = async (activityId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_activities")
      .select()
      .eq("id", activityId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching activity by ID:", error);
    return false;
  }
};

const createActivity = async (
  activityData: Partial<Omit<ClassroomActivityT, "id" | "created_at">>
) => {
  try {
    const supabase = await createClient();

    if (!activityData.classroom_id) {
      throw new Error("Missing required field: classroom_id");
    }

    const { data, error } = await supabase
      .from("classroom_activities")
      .insert(activityData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating activity:", error);
    return false;
  }
};

const updateActivityById = async (
  activityId: string,
  updates: Partial<Omit<ClassroomActivityT, "id" | "created_at">>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_activities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", activityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating activity:", error);
    return false;
  }
};

const createMultipleActivities = async (
  activitiesData: Partial<Omit<ClassroomActivityT, "id" | "created_at">>[]
) => {
  try {
    const supabase = await createClient();

    // Validate required fields
    for (const activityData of activitiesData) {
      if (!activityData.classroom_id) {
        throw new Error(
          "Missing required field: classroom_id in one or more activities"
        );
      }
    }

    const { data, error } = await supabase
      .from("classroom_activities")
      .insert(activitiesData)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating multiple activities:", error);
    return false;
  }
};

const deleteActivityById = async (activityId: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_activities")
      .delete()
      .eq("id", activityId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    return false;
  }
};

export {
  getAllActivitiesByClassroomId,
  getActivityById,
  createActivity,
  createMultipleActivities,
  updateActivityById,
  deleteActivityById,
};