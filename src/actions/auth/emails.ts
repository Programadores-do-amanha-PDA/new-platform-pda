"use server";

import { logger } from "@/lib/logger";
import { getSupabaseAdminClient, getSupabaseClient } from "@/lib/supabase/client-manager";
import { REGEX_FOR_EMAIL_VALIDATION } from "@/utils/regex/user-regex-validations";

type SendEmailVerificationToMultipleUsersResultT = {
    success: boolean;
    results:
        | {
              successful: string[];
              failed: string[];
              total: number;
          }
        | undefined;
    error: null | string;
};
type SendPasswordResetToMultipleUsersResultT = {
    success: boolean;
    results?:
        | {
              successful: string[];
              failed: string[];
              total: number;
          }
        | undefined;
    error?: null | string;
};

const log = logger.child({ module: "AuthEmailsActions" });

export const requestPasswordResetByEmail = async ({ email }: { email: string }): Promise<boolean> => {
    try {
        if (!email || !REGEX_FOR_EMAIL_VALIDATION.test(email)) throw new Error("Email not specified");

        const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL;
        if (!PLATFORM_BASE_URL) throw new Error("Platform base URL not specified");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const redirectUrlForPKCE = `${PLATFORM_BASE_URL}/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrlForPKCE,
        });

        if (error) throw new Error(error.message);

        return true;
    } catch (error) {
        log.error({ err: error, email, operation: "requestPasswordResetByEmail" }, "Error requesting password reset");
        return false;
    }
};

export const sendPasswordResetToMultipleUsers = async (emails: string[]): Promise<SendPasswordResetToMultipleUsersResultT> => {
    try {
        if (!emails || emails.length === 0) {
            throw new Error("Emails not specified");
        }

        const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL;
        if (!PLATFORM_BASE_URL) throw new Error("Platform base URL not specified");

        const successful: string[] = [];
        const failed: string[] = [];

        const supabase = await getSupabaseAdminClient();

        // Execute sequentially to avoid potential Supabase rate limiting or context issues
        for (const email of emails) {
            if (!email || !REGEX_FOR_EMAIL_VALIDATION.test(email)) throw new Error("Invalid email");

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
                log.error({ err: error, email, operation: "sendPasswordResetToMultipleUsers" }, "Error sending password reset");
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
        log.error({ err: error, operation: "sendPasswordResetToMultipleUsers" }, "Error sending password reset emails");
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

export const resendEmailSignupConfirmationToMultipleUsers = async (
    emails: string[],
): Promise<SendEmailVerificationToMultipleUsersResultT> => {
    try {
        if (!emails || emails.length === 0) {
            throw new Error("Emails not specified");
        }

        const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL;
        if (!PLATFORM_BASE_URL) throw new Error("Platform base URL not specified");

        const supabase = await getSupabaseAdminClient();

        const successful: string[] = [];
        const failed: string[] = [];

        // Execute sequentially to avoid potential Supabase rate limiting or context issues
        for (const email of emails) {
            try {
                if (!email || !REGEX_FOR_EMAIL_VALIDATION.test(email)) throw new Error("Invalid email");

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
                log.error(
                    { err: error, email, operation: "resendEmailSignupConfirmation" },
                    `Error sending email verification`,
                );
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
            error: null,
        };
    } catch (error) {
        log.error({ err: error, operation: "resendEmailSignupConfirmation" }, "Error sending email verification emails");
        return {
            success: false,
            results: undefined,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};
