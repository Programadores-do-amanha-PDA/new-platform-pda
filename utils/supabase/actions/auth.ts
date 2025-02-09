"use server";
import { createClient } from "@/utils/supabase/server";
import { AuthUser } from "@supabase/supabase-js";

type UserAuthLogin = {
  email: string;
  password: string;
};

export async function login(userCredentials: UserAuthLogin) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword(
      userCredentials
    );
    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    return error.message;
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

export const requestPasswordResetWithUserEmail = async (userEmail: string) => {
  try {
    const supabase = await createClient();
    const PLATFORM_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_BASE_URL;

    if (!PLATFORM_BASE_URL) throw "Platform base URL not specified";

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: PLATFORM_BASE_URL.concat("/login/reset"),
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
};

export const resendAnEmailSignupConfirmation = async (email: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_PLATFORM_BASE_URL,
      },
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
