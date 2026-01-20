"use server";

import { logger } from "@/lib/logger";
import { getSupabaseAdminClient, getSupabaseClient } from "@/lib/supabase";
import { REGEX_FOR_EMAIL_VALIDATION } from "@/utils/regex";

type SendEmailToMultipleUsersResult =
    | {
          readonly results: {
              readonly successful: string[];
              readonly failed: string[];
              readonly total: number;
          };
          readonly error: null;
      }
    | {
          readonly results: null;
          readonly error: string;
      };

const log = logger.child({ module: "AuthEmailsActions" });

/**
 * Requests a password reset email for a user.
 *
 * @param {Object} params - The parameters object
 * @param {string} params.email - The email address of the user requesting password reset
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the password reset email was sent successfully, false otherwise
 *
 * @throws Logs errors internally but does not throw. Returns false on failure.
 *
 * @example
 * const success = await requestPasswordResetByEmail({ email: 'user@example.com' });
 * if (success) {
 *   console.log('Password reset email sent');
 * }
 */
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

/**
 * Sends a password reset email to multiple users.
 *
 * @param {Object} params - The parameters object
 * @param {string[]} params.emails - Array of email addresses to send password reset emails to
 *
 * @returns {Promise<SendEmailToMultipleUsersResult>} A discriminated union promise that resolves to:
 *   - On success: `{ results: { successful: string[], failed: string[], total: number }, error: null }`
 *   - On error: `{ results: null, error: string }`
 *
 * @throws Will catch and log errors, returning them in the result object rather than throwing
 *
 * @example
 * ```typescript
 * const {error, results} = await sendPasswordResetToMultipleUsers({
 *   emails: ['user1@example.com', 'user2@example.com']
 * });

 * ```
 */
export const sendPasswordResetToMultipleUsers = async ({
    emails,
}: {
    emails: string[];
}): Promise<SendEmailToMultipleUsersResult> => {
    try {
        if (!emails || emails.length === 0 || !Array.isArray(emails)) throw new Error("Emails not specified");

        const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL;
        if (!PLATFORM_BASE_URL) throw new Error("Platform base URL not specified");

        const supabase = await getSupabaseAdminClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const successful: string[] = [];
        const failed: string[] = [];

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
            error: null,
            results: {
                successful,
                failed,
                total: emails.length,
            },
        };
    } catch (error) {
        log.error({ err: error, emails, operation: "sendPasswordResetToMultipleUsers" }, "Error sending password reset emails");
        return {
            results: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

/**
 * Resend email signup confirmation to multiple users.
 *
 * This function attempts to send signup confirmation emails to a list of provided email addresses.
 * It processes each email individually, tracking successful and failed attempts separately.
 * A small delay is added between requests when processing multiple emails to prevent rate limiting.
 *
 * @param {Object} params - The parameters object.
 * @param {string[]} params.emails - Array of email addresses to send confirmation emails to.
 *
 * @returns {Promise<SendEmailToMultipleUsersResult>} A discriminated union promise that resolves to:
 *   - On success: `{ results: { successful: string[], failed: string[], total: number }, error: null }`
 *   - On error: `{ results: null, error: string }`
 *
 * @throws Does not throw errors directly; errors are caught and returned in the result object.
 *
 * @example
 * const {error, results} = await resendEmailSignupConfirmationToMultipleUsers({
 *   emails: ['user1@example.com', 'user2@example.com']
 * });
 */
export const resendEmailSignupConfirmationToMultipleUsers = async ({
    emails,
}: {
    emails: string[];
}): Promise<SendEmailToMultipleUsersResult> => {
    try {
        if (!emails || emails.length === 0 || !Array.isArray(emails)) throw new Error("Emails not specified");

        const PLATFORM_BASE_URL = process.env.PLATFORM_BASE_URL;
        if (!PLATFORM_BASE_URL) throw new Error("Platform base URL not specified");

        const supabase = await getSupabaseAdminClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const successful: string[] = [];
        const failed: string[] = [];

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
            error: null,
            results: {
                successful,
                failed,
                total: emails.length,
            },
        };
    } catch (error) {
        log.error(
            { err: error, emails, operation: "resendEmailSignupConfirmation" },
            "Error sending email verification emails",
        );
        return {
            results: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};
