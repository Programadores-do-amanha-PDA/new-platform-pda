"use server";
import { createClient } from "@/lib/supabase/server";
import { RolePermissionT, RolesT } from "@/types";

export const getAllRolePermissions = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("role_permissions")
      .select("*");

    if (error) throw error;

    return data as RolePermissionT[];
  } catch (error) {
    console.error("SELECT -> role_permissions", error);
    return [];
  }
};

export const getPermissionsByRole = async (role: RolesT) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("role_permissions")
      .select("permission")
      .eq("role", role);

    if (error) throw error;

    return data.map(item => item.permission);
  } catch (error) {
    console.error("SELECT -> role_permissions by role", error);
    return [];
  }
};

export const insertRolePermission = async (
  role: RolesT,
  permission: string
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("role_permissions")
      .insert({ role, permission })
      .select();

    if (error) throw error;

    return data[0] as RolePermissionT;
  } catch (error) {
    console.error("INSERT -> role_permissions", error);
    return null;
  }
};

export const deleteRolePermission = async (
  role: RolesT,
  permission: string
) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role", role)
      .eq("permission", permission);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("DELETE -> role_permissions", error);
    return false;
  }
};

export const deleteAllPermissionsForRole = async (role: RolesT) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role", role);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("DELETE -> role_permissions for role", error);
    return false;
  }
};