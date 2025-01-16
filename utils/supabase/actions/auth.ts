"use server";
import { createClient } from "@/utils/supabase/server";

type UserAuth = {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
      email?: string;
      roles?: string[];
    };
  };
};

type UserAuthLogin = {
  email: string;
  password: string;
};

export async function login(userCredentials: UserAuthLogin) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword(
    userCredentials
  );

  console.log(data, error)

  if (error || !data.user) {
    return false;
  }

  return true;
}
export async function makeSingUpWithEmailProvider(userData: UserAuth) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp(userData);

    if (error || !data || !data.user) throw error;

    return data.user.id;
  } catch (e) {
    console.error(e);
    return false;
  }
}
