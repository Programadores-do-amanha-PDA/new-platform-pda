"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { Session } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { useUserEnrollmentsStore } from "@/features/enrollments/stores";
import { getAllCurrentUserDataByIdAsync } from "@/features/users/management/actions/full-user-data";
import { getSession } from "./actions/utils";
import { JwtPayloadT } from "./types/jwt";
import { signOut as signOutAsync } from "./actions";
import { useUserRoleStore } from "../access-control/stores/user-role/user-role";
import { useUserProfileStore } from "@/features/users/profile/store";

const log = logger.child({ module: "AuthStore" });

interface AuthState {
    readonly session: Session | null;
    readonly loading: boolean;
}

interface AuthActions {
    /**
     * Fetches and sets all user information from a JWT token.
     * Decodes the JWT and retrieves user data from the authentication service.
     *
     * @param {Object} params - Parameters object
     * @param {string} params.jwt - JWT token containing user information
     * @returns {Promise<boolean>} true if successful, false otherwise
     * @throws Logs error but returns false instead of throwing
     *
     * @example
     * const success = await fetchAllCurrentUserDataByJWT({ jwt: accessToken });
     * if (!success) console.log('Failed to fetch user from JWT');
     */
    fetchAllCurrentUserDataByJWT: ({ jwt }: { readonly jwt: string }) => Promise<boolean>;

    /**
     * Updates authentication state based on a Supabase session object.
     * Extracts JWT from session and fetches user data accordingly.
     * If session is null or invalid, resets authentication state.
     *
     * @param {Object} params - Parameters object
     * @param {Session | null} params.session - Supabase session object containing access_token
     * @returns {Promise<boolean>} true if successful, false otherwise
     *
     * @example
     * const { data } = await supabase.auth.getSession();
     * await updateAuthState({ session: data.session });
     */
    updateAuthState: ({ session }: { readonly session: Session }) => Promise<boolean>;

    /**
     * Fetches the current user session from Supabase and updates authentication state.
     * This is the primary method for initializing authentication on app load.
     *
     * @returns {Promise<boolean>} true if session found and user authenticated, false otherwise
     *
     * @example
     * useEffect(() => {
     *   const initAuth = async () => {
     *     const success = await fetchSession();
     *     if (!success) handleUnauthenticated();
     *   };
     *   initAuth();
     * }, []);
     */
    fetchSession: () => Promise<boolean>;
    signOut: () => Promise<void>;

    reset: () => void;
}

const initialState: AuthState = {
    session: null,
    loading: true,
};

/**
 * Zustand store for managing authentication state and user data.
 *
 * @remarks
 * This store handles JWT-based authentication, session management, and coordinates
 * user data across multiple related stores (profile, role, enrollments).
 *
 * @example
 * ```typescript
 * // Access the store in a component
 * const { session, loading, fetchSession } = useAuthStore();
 *
 * // Fetch and validate session on mount
 * useEffect(() => {
 *   fetchSession();
 * }, []);
 *
 * // Update auth state with a new session
 * await useAuthStore.getState().updateAuthState({ session: newSession });
 *
 * // Reset all auth-related stores
 * useAuthStore.getState().reset();
 * ```
 *
 * @returns A Zustand store containing {@link AuthState} and {@link AuthActions}
 *
 * @see {@link useUserProfileStore} - Profile data store updated by this store
 * @see {@link useUserRoleStore} - User role store updated by this store
 * @see {@link useUserEnrollmentsStore} - Enrollments store updated by this store
 */
export const useAuthStore = create<AuthState & AuthActions>()(
    devtools(
        (set, get) => ({
            ...initialState,
            fetchAllCurrentUserDataByJWT: async ({ jwt }) => {
                try {
                    if (!jwt) {
                        throw new Error("jwt is required");
                    }

                    set({ loading: true });

                    const decodedJwt = jwtDecode<JwtPayloadT>(jwt);
                    if (!decodedJwt?.sub) throw new Error("Invalid JWT: no user id found");

                    const { data, error } = await getAllCurrentUserDataByIdAsync({ userId: decodedJwt.sub });
                    if (error) throw new Error(error);
                    if (!data) throw new Error("no user data found");

                    // Update separate stores
                    useUserProfileStore.getState().setProfile({ profile: data.profile });
                    useUserRoleStore.getState().setUserRole(data.userRole);
                    useUserEnrollmentsStore.getState().setEnrollments(data.enrollments);

                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "fetchUserByJWT" }, "Error fetching user");

                    return false;
                } finally {
                    set({ loading: false });
                }
            },
            updateAuthState: async ({ session }) => {
                try {
                    if (!session) {
                        set({ ...initialState });
                        return true;
                    }

                    set({ session });

                    const jwt = jwtDecode<JwtPayloadT>(session.access_token);
                    if (!jwt?.user_role) {
                        set({ ...initialState });
                        return false;
                    }

                    const success = await get().fetchAllCurrentUserDataByJWT({ jwt: session.access_token });

                    return success;
                } catch (error) {
                    log.debug({ err: error, operation: "updateAuthState" }, "Error updating auth state");
                    set({ ...initialState });

                    return false;
                } finally {
                    set({ loading: false });
                }
            },
            fetchSession: async () => {
                try {
                    set({ loading: true });

                    const { error, session } = await getSession();
                    if (error) throw new Error(error);
                    if (!session) throw new Error("no session found");

                    const success = await get().updateAuthState({ session });
                    return success;
                } catch (error) {
                    log.warn({ err: error, operation: "fetchSession" }, "Error fetching session");
                    set({ ...initialState });

                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            signOut: async () => {
                await signOutAsync();
                get().reset();
            },

            reset: () => {
                useUserProfileStore.getState().reset();
                useUserRoleStore.getState().reset();
                useUserEnrollmentsStore.getState().reset();
                set({ ...initialState, loading: false });
            },
        }),
        { name: "AuthStore" },
    ),
);
