"use server";
import { ClassroomCoodeshAssessment } from "@/types/coodesh/assessments";
import { createClient } from "@/utils/supabase/server";

export const createCoodeshAssessment = async (
  assessmentData: Partial<ClassroomCoodeshAssessment>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_coodesh_assessments")
      .insert([assessmentData])
      .select();

    if (error) throw error;
    return data[0] as ClassroomCoodeshAssessment;
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
    return data as ClassroomCoodeshAssessment[];
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
    return data as ClassroomCoodeshAssessment;
  } catch (error) {
    console.error("Error fetching classroom coodesh assessment:", error);
    return false;
  }
};

export const updateCoodeshAssessment = async (
  id: string,
  assessmentData: Partial<ClassroomCoodeshAssessment>
) => {
  console.log({ ...assessmentData, updated_at: new Date().toISOString() })
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classroom_coodesh_assessments")
      .update({ ...assessmentData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    console.log(data, error);

    if (error) throw error;
    return data as ClassroomCoodeshAssessment;
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
