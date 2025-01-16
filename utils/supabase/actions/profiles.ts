"use server";
import { createClient } from "@/utils/supabase/server";

export const getAllProfiles = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("profiles").select();

    console.log(data, error)
    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
};
