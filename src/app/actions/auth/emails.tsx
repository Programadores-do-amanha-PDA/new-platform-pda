"use server";
import { createClient } from "@/lib/supabase/server";

export const requestPasswordResetWithUserEmail = async (userEmail: string) => {
  try {
    const supabase = await createClient();
    const PLATFORM_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_PATH;

    if (!PLATFORM_BASE_URL) throw "Platform base URL not specified";

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: PLATFORM_BASE_URL.concat("/reset-password"),
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
        emailRedirectTo: process.env.NEXT_PUBLIC_PLATFORM_PATH,
      },
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
