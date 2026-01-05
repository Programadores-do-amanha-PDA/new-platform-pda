"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

import { logger } from "@/lib/logger";
import { getPermissionsByRole } from "@/actions";
import { AuthUserWithProfile, getProfileById, Profile } from "@/features/dashboard/shared/profile";
import { Permission, Role } from "@/types";

import { getAuthUser, getSession } from ".";
import { JwtPayloadT } from "./types";

const log = logger.child({ module: "AuthStore" });

interface AuthState {
    readonly user: AuthUserWithProfile | null;
    readonly permissions: Permission[];
    readonly loading: boolean;
}

interface AuthActions {
    setUser: (user: AuthUserWithProfile | null) => void;
    setPermissions: (permissions: Permission[]) => void;
    fetchUserProfile: ({ jwt }: { readonly jwt: string }) => Promise<boolean>;
    fetchUserPermissions: ({ role }: { readonly role: Role }) => Promise<boolean>;
    updateAuthState: (session: { access_token: string } | null) => Promise<boolean>;
    fetchSession: () => Promise<boolean>;
    hasPermission: ({ permission }: { readonly permission: string }) => boolean;
    hasAnyPermission: ({ permissions }: { readonly permissions: readonly string[] }) => boolean;
    hasAllPermissions: ({ permissions }: { readonly permissions: readonly string[] }) => boolean;
    reset: () => void;
}

const initialState: AuthState = {
    user: null,
    permissions: [],
    loading: true,
};

export const useAuthStore = create<AuthState & AuthActions>()(
    devtools(
        (set, get) => ({
            ...initialState,
            setUser: (user) => set({ user }),
            setPermissions: (permissions) => set({ permissions }),

            /**
             * Fetches user permissions based on their role.
             * @param role The user's role.
             * @returns true if successful, false otherwise.
             */
            fetchUserPermissions: async ({ role }) => {
                try {
                    if (!role) {
                        throw new Error("role is required");
                    }

                    const permissions = await getPermissionsByRole({role});
                    if (!permissions) throw new Error("no get permissions by role response");

                    set({ permissions });
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, role, operation: "fetchUserPermissions" }, "Error fetching user permissions");
                    }
                    set({ permissions: [] });
                    return false;
                }
            },

            /**
             * Fetches the complete user profile.
             * @param jwt JWT token containing user information.
             * @returns true if successful, false otherwise.
             */
            fetchUserProfile: async ({ jwt }) => {
                try {
                    if (!jwt) {
                        throw new Error("jwt is required");
                    }

                    set({ loading: true });

                    const user = await getAuthUser(jwt);
                    if (!user?.id) {
                        set({ user: null, loading: false });
                        return false;
                    }

                    const userProfile = await getProfileById({ id: user.id });
                    if (!userProfile) {
                        throw new Error("user profile not found");
                    }

                    set({
                        user: {
                            ...user,
                            profile: {
                                ...(userProfile as Profile),
                            },
                        },
                        loading: false,
                    });

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, operation: "fetchUserProfile" }, "Error fetching user profile");
                    }
                    set({
                        user: null,
                        permissions: [],
                        loading: false,
                    });
                    return false;
                }
            },

            /**
             * Updates authentication state based on session.
             * @param session User session containing access_token.
             * @returns true if successful, false otherwise.
             */
            updateAuthState: async (session) => {
                try {
                    if (!session) {
                        set({ ...initialState, loading: false });
                        return true;
                    }

                    const jwt = jwtDecode<JwtPayloadT>(session.access_token);
                    if (!jwt?.user_role) {
                        set({ ...initialState, loading: false });
                        return false;
                    }

                    // Fetch user profile and permissions in parallel
                    const [profileSuccess, permissionsSuccess] = await Promise.all([
                        get().fetchUserProfile({ jwt: session.access_token }),
                        get().fetchUserPermissions({ role: jwt.user_role }),
                    ]);

                    return profileSuccess && permissionsSuccess;
                } catch (error) {
                    if (error instanceof Error) {
                        log.debug({ err: error, operation: "updateAuthState" }, "Error updating auth state");
                    }
                    set({ ...initialState, loading: false });
                    return false;
                }
            },

            /**
             * Fetches current user session and updates authentication state.
             * @returns true if successful, false otherwise.
             */
            fetchSession: async () => {
                try {
                    set({ loading: true });

                    const session = await getSession();
                    if (!session) throw new Error("no session found");

                    const success = await get().updateAuthState(session);
                    return success;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, operation: "fetchSession" }, "Error fetching session");
                    }
                    set({ ...initialState, loading: false });
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            /**
             * Checks if user has a specific permission.
             * @param permission The permission to check.
             * @returns true if user has the permission, false otherwise.
             */
            hasPermission: ({ permission }) => {
                const { permissions } = get();
                return permissions.includes(permission);
            },

            /**
             * Checks if user has any of the provided permissions.
             * @param permissions Array of permissions to check.
             * @returns true if user has at least one permission, false otherwise.
             */
            hasAnyPermission: ({ permissions }) => {
                const { permissions: userPermissions } = get();
                return permissions.some((permission: string) => userPermissions.includes(permission));
            },

            /**
             * Checks if user has all provided permissions.
             * @param permissions Array of permissions to check.
             * @returns true if user has all permissions, false otherwise.
             */
            hasAllPermissions: ({ permissions }) => {
                const { permissions: userPermissions } = get();
                return permissions.every((permission: string) => userPermissions.includes(permission));
            },

            /**
             * Resets authentication state to initial state.
             */
            reset: () => {
                set(initialState);
            },
        }),
        { name: "AuthStore" },
    ),
);
