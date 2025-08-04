"use server";
import { createClient } from "@/lib/supabase/server";
import { UserClassroomT } from "@/types";

export const getAllUsersClassrooms = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_classrooms")
      .select()
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as UserClassroomT[];
  } catch (error) {
    console.error("Error on get all user classrooms", error);
    return null;
  }
};

export const getAllUsersClassroomsByClassroomId = async (
  classroom_id: string
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_classrooms")
      .select()
      .eq("classroom_id", classroom_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as UserClassroomT[];
  } catch (error) {
    console.error("Error on get all user classrooms", error);
    return null;
  }
};

export const getUserClassroomsByUserId = async (userId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_classrooms")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as UserClassroomT[];
  } catch (e) {
    console.error("Error on get user classrooms by user id", e);
    return null;
  }
};

export const insertUserClassroom = async (
  UsersClassrooms: UserClassroomT[]
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_classrooms")
      .insert(UsersClassrooms)
      .select();

    if (error) throw error;

    return data as UserClassroomT[];
  } catch (error) {
    console.error("Error on insert user classroom", error);
    return null;
  }
};

export const deleteUserClassroom = async (
  userId: string,
  classroomsIds: string[]
) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_classrooms")
      .delete()
      .eq("user_id", userId)
      .in("classroom_id", classroomsIds);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error on delete user classroom", error);
    return false;
  }
};
