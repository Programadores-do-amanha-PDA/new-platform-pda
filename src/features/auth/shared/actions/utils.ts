import createClient from "@/lib/supabase/client";
import { AuthError, AuthUser, Session } from "@supabase/supabase-js";

type GetAuthUserByJWTResult =
    | {
          readonly user: AuthUser;
          readonly error: null;
      }
    | {
          readonly user: null;
          readonly error: string;
      };

type SetSessionResult =
    | {
          readonly session: Session;
          readonly error: null;
      }
    | {
          readonly session: null;
          readonly error: string;
      };

/**
 * Retrieves the authenticated user information from a JWT token.
 *
 * @async
 * @function
 * @param {Object} params - The parameters object
 * @param {string} params.jwt - The JWT token to validate and extract user data from
 *
 * @returns {Promise<GetAuthUserByJWTResult>} A promise that resolves to an object containing:
 *   - `user`: The authenticated user object if successful, or null if an error occurs
 *   - `error`: An error message string if an error occurs, or null if successful
 *
 * @throws Does not throw errors directly; instead returns them in the result object
 *
 * @example
 * const { error, user } = await getAuthUserByJWT({ jwt: "your_jwt_token" });
 */
export const getAuthUserByJWT = async ({ jwt }: { jwt: string }): Promise<GetAuthUserByJWTResult> => {
    try {
        if (!jwt) throw new Error("JWT not provided");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const {
            data: { user },
        } = await supabase.auth.getUser(jwt);

        if (!user) throw "user not found";
        return { user, error: null };
    } catch (error) {
        console.error("Error fetching auth user:", error);
        return { user: null, error: error instanceof Error || error instanceof AuthError ? error.message : "unknown error" };
    }
};

/**
 * Retrieves the current user session from the Supabase authentication client.
 *
 * @async
 * @function
 * @returns {Promise<SetSessionResult>} A promise that resolves to an object containing the session data
 * and any potential error. If no session is returned or an error occurs, the session will be `null`
 * and the error will contain the corresponding message.
 *
 * @throws {Error} Throws an error if the session retrieval fails or no session is returned.
 *
 * @example
 * const {error, session} = await getSession();
 */
export const getSession = async (): Promise<SetSessionResult> => {
    try {
        const supabase = await createClient();
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) throw new Error("No session returned");

        return { session, error: null };
    } catch (error) {
        console.error("Error fetching session:", error);
        return {
            session: null,
            error: error instanceof Error || error instanceof AuthError ? error.message : "unknown error",
        };
    }
};
