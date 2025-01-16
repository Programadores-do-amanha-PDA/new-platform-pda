"use server";
import { createClient } from "@/utils/supabase/server";
import { jwtDecode } from "jwt-decode";

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

export const getUserRole = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;
    if (!data || !data?.session) throw error;

    const jwt = jwtDecode(data.session.access_token);
    const userRole = jwt.user_role;

    return userRole;
  } catch (e) {
    console.log("ROLE_ERROR", e);
    return false;
  }
};
