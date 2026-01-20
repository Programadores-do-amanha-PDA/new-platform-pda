"use server";

import { UserAuthLoginT } from "@/features/dashboard/shared/users-management/types";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { AuthError, AuthUser, Session } from "@supabase/supabase-js";

type UpdateAuthUserResultT = { user: AuthUser; error: null } | { user: null; error: string };
type SetSessionResultT = { session: Session; error: null } | { session: null; error: string };

const log = logger.child({ module: "UserAuthActions" });


/**
 * Updates the authenticated user's information in Supabase Auth.
 * 
 * @param options - The update options object
 * @param options.updates - Partial user data to update (e.g., email, password, user_metadata)
 * @returns A promise that resolves to an object containing either the updated user data or an error message
 * @returns The result object has two properties:
 *   - `user`: The updated Supabase user object, or null if an error occurred
 *   - `error`: An error message string if something went wrong, or null on success
 * @throws Does not throw; errors are caught and returned in the result object
 * 
 * @example
 * const { error, user } = await updateAuthUser({
 *   updates: { email: 'newemail@example.com' }
 * });
 */
export const updateAuthUser = async ({ updates }: { updates: Partial<UserAuthLoginT> }): Promise<UpdateAuthUserResultT> => {
    try {
        if (!updates) throw new Error("No updates provided");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.auth.updateUser({ ...updates });
        if (error) throw error;
        if (!data) throw new Error("No user data returned");

        return { user: data.user, error: null };
    } catch (error) {
        log.error({ err: error, updates, operation: "updateAuthUser" }, "Error updating auth user");
        return {
            user: null,
            error: error instanceof Error ? error.message : error instanceof AuthError ? error.message : "unknown error",
        };
    }
};


/**
 * Sets a user session with the provided access and refresh tokens.
 * 
 * @param {Object} params - The session parameters
 * @param {string} params.access_token - The access token for authentication
 * @param {string} params.refresh_token - The refresh token for session refresh
 * @returns {Promise<SetSessionResultT>} A promise that resolves to an object containing either:
 *   - `session`: The authenticated session object, or `null` if an error occurred
 *   - `error`: `null` if successful, or an error message string if an error occurred
 * 
 * @throws Logs errors internally but does not throw; errors are returned in the result object
 * 
 * @example
 * const { error, session } = await setSession({
 *   access_token: "eyJhbG...",
 *   refresh_token: "eyJhbG..."
 * });
 */
export const setSession = async ({
    access_token,
    refresh_token,
}: {
    access_token: string;
    refresh_token: string;
}): Promise<SetSessionResultT> => {
    try {
        if (!access_token) throw new Error("Access token not provided");
        if (!refresh_token) throw new Error("Refresh token not provided");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const {
            data: { session },
            error,
        } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });
        if (error) throw error;
        if (!session) throw new Error("No session returned");

        return { session, error: null };
    } catch (error) {
        log.error({ err: error, operation: "setSession" }, "Error setting session");
        return {
            error: error instanceof Error ? error.message : error instanceof AuthError ? error.message : "unknown error",
            session: null,
        };
    }
};

/**
 * Signs out the currently authenticated user from Supabase.
 * 
 * @returns {Promise<boolean>} A promise that resolves to `true` if sign-out was successful,
 *                              or `false` if an error occurred during the sign-out process.
 * 
 * @throws Does not throw, but logs errors internally and returns `false` on failure.
 * 
 * @example
 * const success = await signOut();
 * if (success) {
 *   console.log("User signed out successfully");
 * } else {
 *   console.log("Sign-out failed");
 * }
 */
export const signOut = async (): Promise<boolean> => {
    try {
        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        return true;
    } catch (error) {
        log.error({ err: error, operation: "signOut" }, "Error signing out");
        return false;
    }
};
