"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomProject } from "../types/projects/project";

export const createClassroomProject = async (
  projectData: Omit<ClassroomProject, "id" | "created_at">
): Promise<ClassroomProject | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_projects")
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomProject;
  } catch (error) {
    console.error("Error creating classroom project:", error);
    return null;
  }
};

export const getAllProjectsByClassroomId = async (
  classRoomId: string
): Promise<ClassroomProject[] | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_projects")
      .select()
      .eq("classroom_id", classRoomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassroomProject[];
  } catch (error) {
    console.error("Error fetching all classroom projects:", error);
    return null;
  }
};



export const getClassroomProjectById = async (
  id: string
): Promise<ClassroomProject | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_projects")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ClassroomProject;
  } catch (error) {
    console.error("Error fetching classroom project:", error);
    return null;
  }
};

export const updateClassroomProjectById = async (
  id: string,
  projectData: Partial<ClassroomProject>
): Promise<ClassroomProject | null> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classroom_projects")
      .update({ ...projectData })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomProject;
  } catch (error) {
    console.error("Error updating classroom project:", error);
    return null;
  }
};

export const deleteProjectById = async (id: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting classroom coodesh assessment:", error);
    return false;
  }
};
