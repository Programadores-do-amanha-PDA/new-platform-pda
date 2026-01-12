import { logger } from "@/lib/logger";
import { getSupabaseClient } from "@/lib/supabase/client-manager";

const log = logger.child({ module: "EmailConfirmationActions" });

/**
 * Resends the email signup confirmation to the specified email address.
 *
 * @param {Object} params - The parameters object
 * @param {string} params.email - The email address to send the confirmation to
 * @returns {Promise<boolean>} Returns true if the email was sent successfully, false otherwise
 * @throws Will catch and log any errors that occur during the resend process
 *
 * @example
 * const success = await resendEmailSignupConfirmation({ email: 'user@example.com' });
 */
export const resendEmailSignupConfirmation = async ({ email }: { email: string }): Promise<boolean> => {
    try {
        if (!email) throw new Error("Email not specified");

        const supabase = await getSupabaseClient();

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
        log.error(
            { err: error, email, operation: "resendEmailSignupConfirmation" },
            "Error resending email signup confirmation",
        );
        return false;
    }
};
