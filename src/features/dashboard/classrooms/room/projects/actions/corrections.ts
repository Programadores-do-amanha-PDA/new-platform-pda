"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassProjectCorrection } from "../types";

export const createClassroomProjectCorrection = async (
  correctionData: Omit<Partial<ClassProjectCorrection>, "id" | "created_at">
): Promise<ClassProjectCorrection | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_corrections")
      .insert([correctionData])
      .select()
      .single();

    if (error) throw error;
    return data as ClassProjectCorrection;
  } catch (error) {
    console.error("Error creating classroom project correction:", error);
    return null;
  }
};

export const getAllCorrectionsByProjectId = async (
  projectId: string
): Promise<ClassProjectCorrection[] | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_corrections")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassProjectCorrection[];
  } catch (error) {
    console.error("Error fetching corrections by project ID:", error);
    return null;
  }
};

export const getAllCorrectionsByDeliveryId = async (
  deliveryId: string
): Promise<ClassProjectCorrection[] | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_corrections")
      .select("*")
      .eq("delivery_id", deliveryId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassProjectCorrection[];
  } catch (error) {
    console.error("Error fetching corrections by delivery ID:", error);
    return null;
  }
};

export const getAllCorrectionsByClassroomId = async (
  classroomId: string
): Promise<ClassProjectCorrection[] | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_corrections")
      .select(`
        *,
        classroom_projects!inner(classroom_id)
      `)
      .eq("classroom_projects.classroom_id", classroomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassProjectCorrection[];
  } catch (error) {
    console.error("Error fetching all classroom corrections:", error);
    return null;
  }
};

export const getClassroomProjectCorrectionById = async (
  id: string
): Promise<ClassProjectCorrection | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_corrections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ClassProjectCorrection;
  } catch (error) {
    console.error("Error fetching classroom project correction:", error);
    return null;
  }
};

export const updateClassroomProjectCorrectionById = async (
  id: string,
  correctionData: Partial<ClassProjectCorrection>
): Promise<ClassProjectCorrection | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_corrections")
      .update({ ...correctionData })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ClassProjectCorrection;
  } catch (error) {
    console.error("Error updating classroom project correction:", error);
    return null;
  }
};

export const deleteCorrectionById = async (id: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_project_corrections")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting classroom project correction:", error);
    return false;
  }
};