"use server";

import { createClient } from "@/utils/supabase/server";
import { CurriculumType } from "@/types/curriculum";

export const createUserCurriculum = async (curriculumData: CurriculumType) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_curriculum")
      .insert([curriculumData])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error creating user curriculum:", error);
    return false;
  }
};

export const getAllUserCurriculum = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("user_curriculum").select();
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all user curriculums:", error);
    return false;
  }
};

export const getUserCurriculumByUserId = async (userId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_curriculum")
      .select()
      .eq("user_id", userId)
      .single();
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching user curriculum  by user id:", error);
    return false;
  }
};

export const getUserCurriculumById = async (id: number) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_curriculum")
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

export const updateUserCurriculumById = async (
  id: number,
  curriculumData: Partial<CurriculumType>
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_curriculum")
      .update(curriculumData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error updating user curriculum by id:", error);
    return false;
  }
};

export const deleteUserCurriculumById = async (id: number) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_curriculum")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting user curriculum by id:", error);
    return false;
  }
};
