"use server";
import { createClient } from "@/lib/supabase/server";
import { AuthUser } from "@supabase/supabase-js";

type UserAuthLogin = {
  email: string;
  password: string;
};

export async function signInWithPassword(userCredentials: UserAuthLogin) {
  try {
    const supabase = await createClient();

    if (!userCredentials.email || !userCredentials.password)
      throw new Error("Invalid credentials");

    const { data, error } = await supabase.auth.signInWithPassword(
      userCredentials
    );
    if (error) throw error;

    return { error: false, data };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Request failed with status code 403" ||
        error.message === "Email not confirmed")
    ) {
      return { error: true, confirmation: true };
    } else {
      console.log("Error on signInWithPassword", error);
      return { error: true, confirmation: false };
    }
  }
}

export const updateAuthUser = async (updates: Partial<AuthUser>) => {
  try {
    console.log("updates ---", updates);
    const supabase = await createClient();
    const { data, error } = await supabase.auth.updateUser({ ...updates });

    if (error || !data) throw error;

    return data;
  } catch (error) {
    console.log("Error on update auth user", error);
    return false;
  }
};

export const setSession = async (
  access_token: string,
  refresh_token: string
) => {
  try {
    const supabase = await createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return session;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const signOut = async () => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
};
