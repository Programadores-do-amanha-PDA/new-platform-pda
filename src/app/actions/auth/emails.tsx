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

export const sendPasswordResetToMultipleUsers = async (emails: string[]) => {
  try {
    const supabase = await createClient();
    const PLATFORM_BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_PATH;

    if (!PLATFORM_BASE_URL) throw "Platform base URL not specified";

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: PLATFORM_BASE_URL.concat("/reset-password"),
        });
        
        if (error) throw error;
        return { email, success: true };
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      success: true,
      results: {
        successful,
        failed,
        total: emails.length
      }
    };
  } catch (error) {
    console.error("Error sending password reset emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
