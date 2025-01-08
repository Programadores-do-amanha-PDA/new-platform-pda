"use server";
import { createClient } from "@/utils/supabase/server";

export const getRoleWithUserId = async (user_id: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_roles")
      .select()
      .eq("user_id", user_id);
    
    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
};
