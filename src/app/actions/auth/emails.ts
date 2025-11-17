"use server";
import { createClient, createClientAdmin } from "@/lib/supabase/server";
import {
  SendEmailVerificationToMultipleUsersResultT,
  SendPasswordResetToMultipleUsersResultT,
} from "@/types";
import { emailRegex } from "@/utils/regex/users";

export const requestPasswordResetWithUserEmail = async (
  userEmail: string,
): Promise<boolean> => {
  try {
    if (!userEmail) throw new Error("User email not specified");

    const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL;
    if (!PLATFORM_BASE_URL) throw new Error("Platform base URL not specified");

    const supabase = await createClient();

    // For PKCE flow, redirect to callback page which will handle the code exchange
    const redirectUrl = `${PLATFORM_BASE_URL}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: redirectUrl,
    });

    if (error) throw new Error(error.message);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const resendAnEmailSignupConfirmation = async (email: string) => {
  try {
    if (!email) throw new Error("Email not specified");

    const supabase = await createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: process.env.PLATFORM_BASE_URL,
      },
    });
    if (error) throw new Error(error.message);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const sendPasswordResetToMultipleUsers = async (
  emails: string[],
): Promise<SendPasswordResetToMultipleUsersResultT> => {
  try {
    if (!emails || emails.length === 0) {
      throw new Error("Emails not specified");
    }

    const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL;
    if (!PLATFORM_BASE_URL) throw new Error("Platform base URL not specified");

    const successful: string[] = [];
    const failed: string[] = [];

    const supabase = await createClientAdmin();

    // Execute sequentially to avoid potential Supabase rate limiting or context issues
    for (const email of emails) {
      if (!email || !emailRegex.test(email)) throw new Error("Invalid email");

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: PLATFORM_BASE_URL,
        });

        if (error) throw error;
        successful.push(email);

        // Add small delay between requests to prevent rate limiting
        if (emails.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error sending password reset to ${email}:`, error);
        failed.push(email);
      }
    }

    return {
      success: true,
      results: {
        successful,
        failed,
        total: emails.length,
      },
    };
  } catch (error) {
    console.error("Error sending password reset emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const sendEmailVerificationToMultipleUsers = async (
  emails: string[],
): Promise<SendEmailVerificationToMultipleUsersResultT> => {
  try {
    if (!emails || emails.length === 0) {
      throw new Error("Emails not specified");
    }

    const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL;
    if (!PLATFORM_BASE_URL) throw new Error("Platform base URL not specified");

    const supabase = await createClientAdmin();

    const successful: string[] = [];
    const failed: string[] = [];

    // Execute sequentially to avoid potential Supabase rate limiting or context issues
    for (const email of emails) {
      try {
        if (!email || !emailRegex.test(email)) throw new Error("Invalid email");

        const { error } = await supabase.auth.resend({
          type: "signup",
          email: email,
          options: {
            emailRedirectTo: PLATFORM_BASE_URL,
          },
        });

        if (error) throw error;
        successful.push(email);

        // Add small delay between requests to prevent rate limiting
        if (emails.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error sending email verification to ${email}:`, error);
        failed.push(email);
      }
    }

    return {
      success: true,
      results: {
        successful,
        failed,
        total: emails.length,
      },
    };
  } catch (error) {
    console.error("Error sending email verification emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
