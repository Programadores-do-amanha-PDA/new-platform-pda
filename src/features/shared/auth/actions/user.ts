"use server";

import { UserAuthLoginT } from "@/features/dashboard/shared/users/types";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { AuthError, AuthUser, Session } from "@supabase/supabase-js";

type UpdateAuthUserResultT = { user: AuthUser | null; error: null | string | undefined; isAuthError: boolean };
type SetSessionResultT = { session: Session | null; error: unknown | null };


const log = logger.child({ module: "UserAuthActions" });

/**
 * Updates the authenticated user's information.
 *
 * @param {Partial<UserAuthLoginT>} updates - The updates to apply to the user
 * @returns {Promise<{ user: AuthUser | null; error: null | string | undefined; isAuthError: boolean }>} Returns the updated user data, an error object, or null
 *
 * @example
 * const result = await updateAuthUser({ email: 'newemail@example.com' });
 */
export const updateAuthUser = async (updates: Partial<UserAuthLoginT>): Promise<UpdateAuthUserResultT> => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.updateUser({ ...updates });

        if (error || !data) throw error;

        return { user: data.user, error: null, isAuthError: false };
    } catch (error) {
        log.error({ err: error, updates, operation: "updateAuthUser" }, "Error updating auth user");
        if (error instanceof AuthError) {
            return { user: null, error: error.code, isAuthError: true };
        }
        return { user: null, error: null, isAuthError: false };
    }
};

/**
 * Sets the session with the provided access and refresh tokens.
 *
 * @param {string} access_token - The access token
 * @param {string} refresh_token - The refresh token
 * @returns {Promise<{ session: Session | null; error: unknown | null }>} Returns the session and an error object
 *
 * @example
 * const result = await setSession(accessToken, refreshToken);
 */
export const setSession = async (access_token: string, refresh_token: string): Promise<SetSessionResultT> => {
    try {
        const supabase = await createClient();

        const {
            data: { session },
            error,
        } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });
        if (error) throw error;
        return { session, error: null };
    } catch (error) {
        log.error({ err: error, operation: "setSession" }, "Error setting session");
        return { error, session: null };
    }
};

/**
 * Signs out the currently authenticated user.
 *
 * @returns {Promise<boolean>} Returns true if the sign out was successful, false otherwise
 *
 * @example
 * const success = await signOut();
 */
export const signOut = async (): Promise<boolean> => {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return true;
    } catch (error) {
        log.error({ err: error, operation: "signOut" }, "Error signing out");
        return false;
    }
};
