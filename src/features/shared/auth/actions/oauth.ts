import { AuthError, EmailOtpType, Session, User } from "@supabase/supabase-js";
import createClient from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

type VerifyOtpResults = {
    session?: Session;
    user?: User;
    error?: AuthError | Error;
};

const log = logger.child({ module: "AuthOAuthActions" });

/**
 * Verifies the One-Time Password (OTP) using the provided token hash and type.
 *
 * @param {Object} params - The parameters for verifying the OTP.
 * @param {string} params.tokenHash - The hash of the token to verify.
 * @param {string} params.type - The type of OTP (e.g., email).
 * @returns {Promise<VerifyOtpResults>} A promise that resolves to the results of the OTP verification, which includes the session and user information.
 * @throws {Error} Throws an error if the token hash or type is not provided, if the Supabase client is not initialized, or if there is an error during the OTP verification process.
 */
export const verifyOtp = async ({ tokenHash, type }: { tokenHash: string; type: string }): Promise<VerifyOtpResults> => {
    try {
        if (!tokenHash) throw new Error("Token hash not provided");
        if (!type) throw new Error("Type not provided");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.auth.verifyOtp({
            type: type as EmailOtpType,
            token_hash: tokenHash,
        });
        if (error) throw new Error(error.message);
        if (!data.session) throw new Error("Session not created");

        return {
            session: data.session,
            user: data.user || data.session.user,
        };
    } catch (error) {
        log.error({ err: error, operation: "verifyOtp" }, "Error verifying OTP");
        return { error: error instanceof Error ? error : new Error(String(error)) };
    }
};
