"use server";

import { AssessmentType } from "@/types/assessments";
import { createClient } from "@/utils/supabase/server";

export const createTeamCoodeshAssessment = async (
  assessmentData: Partial<AssessmentType>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_coodesh_assessments")
      .insert([assessmentData])
      .select();

    if (error) throw error;
    return data[0] as AssessmentType;
  } catch (error) {
    console.error("Error creating team coodesh assessment:", error);
    return false;
  }
};

export const getAllTeamCoodeshAssessments = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_coodesh_assessments")
      .select()
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as AssessmentType[];
  } catch (error) {
    console.error("Error fetching all team coodesh assessments:", error);
    return false;
  }
};

export const getTeamCoodeshAssessmentById = async (id: number) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_coodesh_assessments")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as AssessmentType;
  } catch (error) {
    console.error("Error fetching team coodesh assessment:", error);
    return false;
  }
};

export const updateTeamCoodeshAssessment = async (
  id: number,
  assessmentData: Partial<AssessmentType>
) => {
  try {
    const supabase = await createClient();
    // Add updated_at timestamp
    const updatedData = {
      ...assessmentData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("team_coodesh_assessments")
      .update(updatedData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as AssessmentType;
  } catch (error) {
    console.error("Error updating team coodesh assessment:", error);
    return false;
  }
};

export const deleteTeamCoodeshAssessment = async (id: number) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("team_coodesh_assessments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting team coodesh assessment:", error);
    return false;
  }
};
