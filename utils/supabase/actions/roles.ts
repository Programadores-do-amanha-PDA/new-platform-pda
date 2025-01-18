"use server";
import { createClient } from "@/utils/supabase/server";
import { jwtDecode } from "jwt-decode";

export const getAllUserRoles = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("user_roles").select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("SELECT -> user_roles", error);
    return false;
  }
};

export const insertUserRoleWithUserId = async (
  user_id: string,
  role: string
) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user_id, role: role });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("INSERT -> user_roles", error);
    return false;
  }
};

export const updateUserROleWIthUserId = async (
  user_id: string,
  newRole: string
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", user_id);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("UPDATE -> user_roles", error);
    return false;
  }
};

export const deleteUserRoleWithUserId = async (user_id: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", user_id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("DELETE -> user_roles", error);
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
