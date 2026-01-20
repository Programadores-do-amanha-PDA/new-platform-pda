"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { AuthUser, Session } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { getAuthUserByJWT, getSession, JwtPayloadT } from ".";

const log = logger.child({ module: "AuthStore" });

/**
 * Authentication state containing user information and loading status.
 *
 * @property {AuthUser | null} user - The currently authenticated user or null if not authenticated
 * @property {boolean} loading - Loading state indicator for async operations
 */
interface AuthState {
    readonly user: AuthUser | null;
    readonly loading: boolean;
}

/**
 * Actions for managing authentication state and user sessions.
 */
interface AuthActions {
    /**
     * Sets the current user directly in the store.
     *
     * @param {Object} params - Parameters object
     * @param {AuthUser | null} params.user - The user to set in the state (null to clear)
     *
     * @example
     * setUser({ user: null }); // Clear current user
     * setUser({ user: authUser }); // Set authenticated user
     */
    setUser: ({ user }: { user: AuthUser | null }) => void;

    /**
     * Fetches and sets user information from a JWT token.
     * Decodes the JWT and retrieves user data from the authentication service.
     *
     * @param {Object} params - Parameters object
     * @param {string} params.jwt - JWT token containing user information
     * @returns {Promise<boolean>} true if successful, false otherwise
     * @throws Logs error but returns false instead of throwing
     *
     * @example
     * const success = await fetchUserByJWT({ jwt: accessToken });
     * if (!success) console.log('Failed to fetch user from JWT');
     */
    fetchUserByJWT: ({ jwt }: { readonly jwt: string }) => Promise<boolean>;

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

    /**
     * Resets authentication state to initial state (null user, loading: true).
     * Used when user logs out or authentication fails.
     *
     * @example
     * await signOut();
     * reset();
     */
    reset: () => void;
}

const initialState: AuthState = {
    user: null,
    loading: true,
};

/**
 * Zustand authentication store for managing user authentication state and session operations.
 *
 * This store handles:
 * - User authentication state (logged in / logged out)
 * - Session management (JWT tokens, Supabase sessions)
 * - Loading states during async operations
 *
 * Built with Zustand devtools middleware for time-travel debugging.
 *
 * @typedef {AuthState & AuthActions} UseAuthStore
 * @property {AuthUser | null} user - Currently authenticated user (null if not logged in)
 * @property {boolean} loading - Loading indicator for auth operations
 * @property {Function} setUser - Manually set the current user
 * @property {Function} fetchUserByJWT - Authenticate using JWT token
 * @property {Function} updateAuthState - Sync state with Supabase session
 * @property {Function} fetchSession - Fetch current session from Supabase
 * @property {Function} reset - Reset to initial state (logout)
 *
 * @returns {UseAuthStore} Authentication store instance with state and actions
 *
 * @example
 * // Hook usage in components
 * const { user, loading } = useAuthStore();
 * const { fetchSession } = useAuthStore();
 *
 * // Initialize on app load
 * useEffect(() => {
 *   fetchSession();
 * }, []);
 *
 * @example
 * // Authenticate with JWT token
 * const { fetchUserByJWT } = useAuthStore();
 * const success = await fetchUserByJWT({ jwt: accessToken });
 *
 * @example
 * // Logout
 * const { reset } = useAuthStore();
 * await signOut();
 * reset();
 */
export const useAuthStore = create<AuthState & AuthActions>()(
    devtools(
        (set, get) => ({
            ...initialState,
            setUser: ({ user }) => set({ user }),
            fetchUserByJWT: async ({ jwt }) => {
                try {
                    if (!jwt) {
                        throw new Error("jwt is required");
                    }

                    set({ loading: true });

                    const { user, error } = await getAuthUserByJWT({ jwt });
                    if (error) throw new Error(error);
                    if (!user?.id) throw new Error("no user found");

                    set({
                        user,
                    });

                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "fetchUserByJWT" }, "Error fetching user");

                    set({
                        user: null,
                    });

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

                    const jwt = jwtDecode<JwtPayloadT>(session.access_token);
                    if (!jwt?.user_role) {
                        set({ ...initialState });
                        return false;
                    }

                    const success = await get().fetchUserByJWT({ jwt: session.access_token });

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
            reset: () => {
                set(initialState);
            },
        }),
        { name: "AuthStore" },
    ),
);
