import { AuthError, EmailOtpType, Session, User } from "@supabase/supabase-js";
import createClient from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { serializeError } from "../utils";

type VerifyOtpResults =
    | {
          session: Session;
          user: User;
          error: null;
      }
    | {
          session: null;
          user: null;
          error: Error | AuthError;
      };
type VerifyOtpParams = {
    tokenHash: string;
    type: string;
};

const log = logger.child({ module: "AuthOAuthActions" });

/**
 * Verifies a One-Time Password (OTP) using the provided token hash and type.
 *
 * This function interacts with the Supabase authentication service to verify the OTP.
 * It throws errors if required parameters are missing, the Supabase client fails to initialize,
 * or if the OTP verification fails. On success, it returns the authenticated session and user.
 *
 * @param params - An object containing:
 *   @param tokenHash - The hash of the OTP token to verify.
 *   @param type - The type of OTP (e.g., "email", "sms").
 * @returns A promise that resolves to a `VerifyOtpResults` object containing the session, user, and error (Error or AuthError).
 *
 * @throws Error if tokenHash or type is not provided, if the Supabase client is not initialized,
 *         or if OTP verification fails.
 */
export const verifyOtp = async ({ tokenHash, type }: VerifyOtpParams): Promise<VerifyOtpResults> => {
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
            error: null,
        };
    } catch (error) {
        log.error({ err: serializeError(error), operation: "verifyOtp" }, "Error verifying OTP");
        return {
            user: null,
            session: null,
            error: error instanceof Error || error instanceof AuthError ? error : new Error("unknown error"),
        };
    }
};
