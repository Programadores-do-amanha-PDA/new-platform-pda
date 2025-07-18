"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomT } from "@/types/classrooms";

export const createClassroom = async (
  classroomData: Partial<ClassroomT>
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classrooms")
      .insert([classroomData])
      .select();

    if (error) throw error;

    return data[0] as ClassroomT;
  } catch (error) {
    console.error("Error creating team:", error);
    return false;
  }
};

export const getAllClassrooms = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classrooms")
      .select("*, classroom_coodesh_assessments(*)")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data as ClassroomT[];
  } catch (error) {
    console.error("Error fetching all classrooms:", error);
    return false;
  }
};

export const getClassroomsById = async (id: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classrooms")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as ClassroomT;
  } catch (error) {
    console.error("Error fetching team:", error);
    return false;
  }
};

export const updateClassroom = async (
  id: string,
  classroomData: Partial<ClassroomT>
) => {
  try {
    const supabase = await createClient();

    // Add updated_at timestamp
    const updatedData = {
      ...classroomData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("classrooms")
      .update(updatedData)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data[0] as ClassroomT;
  } catch (error) {
    console.error("Error updating team:", error);
    return false;
  }
};

export const deleteClassroom = async (id: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("classrooms").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting team:", error);
    return false;
  }
};
