"use server";
import { createClient } from "@/lib/supabase/server";
import { ProfileT, RolesT } from "@/types";

export const createProfile = async (profileData: {
  full_name: string;
  email: string;
  user_role: number;
}) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData])
      .select();

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error creating profile:", error);
    return null;
  }
};

export const getAllProfiles = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, created_at, updated_at, user_roles(id, role), classrooms:user_classrooms(classroom_id)"
      );

    if (error) throw error;

    return data as ProfileT[];
  } catch (error) {
    console.error("Error fetching all alumni profiles:", error);
    return null;
  }
};

export const getAllProfilesFilteredByRole = async (role: RolesT) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "*, user_roles!inner(id, role), classrooms:user_classrooms(classroom_id)"
      )
      .eq("user_roles.role", role);

    if (error) throw error;

    return data as ProfileT[];
  } catch (error) {
    console.error("Error fetching all filtered profiles:", error);
    return null;
  }
};

export const getProfileById = async (id: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, bio, created_at, updated_at, user_roles(id, role), classrooms:user_classrooms(classroom_id)"
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as ProfileT;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const updateProfile = async (
  id: number,
  profileData: Partial<{ full_name: string; email: string; user_role: number }>
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
};

export const deleteProfile = async (id: number) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting profile:", error);
    return false;
  }
};
