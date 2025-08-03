"use server";

import { createClient } from "@/lib/supabase/server";
import { ResumeT } from "@/types";

export const createUserResume = async (resumeData: ResumeT) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_resume")
      .insert([resumeData])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error creating user resume:", error);
    return false;
  }
};

export const getAllUserResume = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("user_resume").select();
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all user curriculums:", error);
    return false;
  }
};

export const getUserResumeByUserId = async (userId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_resume")
      .select()
      .eq("user_id", userId)
      .single();
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching user resume  by user id:", error);
    return false;
  }
};

export const getUserResumeById = async (id: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_resume")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all user curriculums by id:", error);
    return false;
  }
};

export const updateUserResumeById = async (
  id: string,
  resumeData: Partial<ResumeT>
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_resume")
      .update(resumeData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error updating user resume by id:", error);
    return false;
  }
};

export const deleteUserResumeById = async (id: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("user_resume").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting user resume by id:", error);
    return false;
  }
};
