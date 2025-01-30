"use server";
import { createClient } from "@/utils/supabase/server";

type UserAuthLogin = {
  email: string;
  password: string;
};

export async function login(userCredentials: UserAuthLogin) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword(
    userCredentials
  );

  console.log(data, error);

  if (error || !data.user) {
    return false;
  }

  return true;
}

export const singOut = async () => {
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

export const clientGetAuthUser = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    return data.user;
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
