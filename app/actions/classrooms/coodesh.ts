"use server";

import { ClassroomCoodeshAssessment } from "@/types/coodesh/assessments";
import { createClient } from "@/utils/supabase/server";

export const createClassroomCoodeshAssessment = async (
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

export const getAllClassroomCoodeshAssessment = async (classRoomId: string) => {
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

export const getClassroomCoodeshAssessmentById = async (id: number) => {
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

export const updateClassroomCoodeshAssessment = async (
  id: string,
  assessmentData: Partial<ClassroomCoodeshAssessment>
) => {
  try {
    const supabase = await createClient();
    // Add updated_at timestamp
    const updatedData = {
      ...assessmentData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("classroom_coodesh_assessments")
      .update(updatedData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as ClassroomCoodeshAssessment;
  } catch (error) {
    console.error("Error updating classroom coodesh assessment:", error);
    return false;
  }
};

export const deleteClassroomCoodeshAssessment = async (id: number) => {
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
