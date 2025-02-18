"use server";
import { AuthUser } from "@supabase/supabase-js";
import { getAllAlumniProfiles } from "@/app/actions/profiles";
import { createClientAdmin } from "@/utils/supabase/server";
import { AuthUserWithProfileType } from "@/types/auth";

export const getAllAlumni = async () => {
  try {
    const supabase = await createClientAdmin();
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    const alumniProfiles = await getAllAlumniProfiles();

    if (!users || !alumniProfiles) {
      throw new Error("users and alumni profiles is not available");
    }

    const allAlumni: AuthUserWithProfileType[] = alumniProfiles
      .map((alumni) => {
        const user = users?.find((p) => p.id === alumni.id);
        if (user) {
          return {
            ...user,
            profile: alumni,
          };
        }
        return null;
      })
      .filter((alumni): alumni is AuthUserWithProfileType => alumni !== null);

    return allAlumni;
  } catch (error) {
    console.error("Error fetching all auth users:", error);
    return false;
  }
};

export const getAllUsers = async () => {
  try {
    const supabase = await createClientAdmin();
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    return users;
  } catch (error) {
    console.error("Error fetching all auth users:", error);
    return false;
  }
};

export const getUserByID = async (userId: string) => {
  try {
    const supabase = await createClientAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(userId);

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Error fetching all auth users:", error);
    return false;
  }
};

export const createUser = async (userData: Partial<AuthUser>) => {
  try {
    const supabase = await createClientAdmin();

    const {
      data: { user },
      error,
    } = await supabase.auth.admin.createUser(userData);

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Error creating auth user:", error);
    return false;
  }
};

export const updateUser = async (
  userId: string,
  updates: Partial<AuthUser>
) => {
  try {
    console.log("updates ---", updates);
    const supabase = await createClientAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.updateUserById(userId, { ...updates });

    if (error || !user) throw error;

    return user;
  } catch (error) {
    console.log("Error on update auth user", error);
    return false;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const supabase = await createClientAdmin();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.log("Error on delete auth user", error);
    return false;
  }
};
