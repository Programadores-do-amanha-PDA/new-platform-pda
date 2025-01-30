import { AuthUser } from "@supabase/supabase-js";
import { createClientAdmin } from "../server";

export const adminGetAllUsers = async () => {
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

export const adminGetUserByID = async (userId: string) => {
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

export const adminCreateUser = async (userData: Partial<AuthUser>) => {
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

export const adminUpdateUser = async (
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

export const adminDeleteUser = async (userId: string) => {
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
