"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomCoodeshAssessmentT } from "@/types";

export const createCoodeshAssessment = async (
  assessmentData: Partial<ClassroomCoodeshAssessmentT>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_coodesh_assessments")
      .insert([assessmentData])
      .select();

    if (error) throw error;
    return data[0] as ClassroomCoodeshAssessmentT;
  } catch (error) {
    console.error("Error creating classroom coodesh assessment:", error);
    return false;
  }
};

export const getAllCoodeshAssessment = async (classRoomId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_coodesh_assessments")
      .select()
      .eq("classroom_id", classRoomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassroomCoodeshAssessmentT[];
  } catch (error) {
    console.error("Error fetching all classroom coodesh assessments:", error);
    return false;
  }
};

export const getCoodeshAssessmentById = async (id: number) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_coodesh_assessments")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ClassroomCoodeshAssessmentT;
  } catch (error) {
    console.error("Error fetching classroom coodesh assessment:", error);
    return false;
  }
};

export const updateCoodeshAssessment = async (
  id: string,
  assessmentData: Partial<ClassroomCoodeshAssessmentT>
) => {
  try {
    const supabase = await createClient();
    
    const updates = { ...assessmentData, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from("classroom_coodesh_assessments")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as ClassroomCoodeshAssessmentT;
  } catch (error) {
    console.error("Error updating classroom coodesh assessment:", error);
    return false;
  }
};

export const deleteCoodeshAssessment = async (id: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_coodesh_assessments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting classroom coodesh assessment:", error);
    return false;
  }
};
