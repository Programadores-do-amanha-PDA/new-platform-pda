"use server";
import { createClient } from "@/utils/supabase/server";

export const getAllProfiles = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, created_at, updated_at, user_roles(id, role)"
      );

    console.log(data, error);
    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
};
