"Use client";

// Global import
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

// Actions
import { getProfileById, getAuthUser, getSession, getPermissionsByRole } from "@/actions";

// Types
import { JwtPayloadT, Profile, AuthActionsT, AuthStateT } from "@/types";

const initialState: AuthStateT = {
    user: null,
    userRole: null,
    permissions: [],
    loading: true,
};

export const useAuthStore = create<AuthStateT & AuthActionsT>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setUser: (user) => set({ user }),
            setUserRole: (userRole) => set({ userRole }),
            setPermissions: (permissions) => set({ permissions }),

            fetchUserPermissions: async (role) => {
                try {
                    const permissions = await getPermissionsByRole(role);
                    set({ permissions });
                } catch (error) {
                    console.error("Error fetching permissions:", error);
                    set({ permissions: [] });
                }
            },

            getUserProfile: async (jwt) => {
                try {
                    const user = await getAuthUser(jwt);
                    if (!user?.id) {
                        set({ user: null, loading: false });
                        return;
                    }

                    const [userProfile] = await Promise.all([getProfileById({ id: user.id })]);

                    if (userProfile) {
                        set({
                            user: {
                                ...user,
                                profile: {
                                    ...(userProfile as Profile),
                                },
                            },
                            loading: false,
                        });
                    } else {
                        set({ user: null, loading: false });
                    }
                } catch {
                    set({
                        user: null,
                        userRole: null,
                        permissions: [],
                        loading: false,
                    });
                }
            },

            updateAuthState: async (session) => {
                try {
                    if (!session) {
                        set({ ...initialState, loading: false });
                        return;
                    }

                    const jwt = jwtDecode<JwtPayloadT>(session.access_token);
                    if (!jwt?.user_role) {
                        set({ ...initialState, loading: false });
                        return;
                    }

                    set({ userRole: jwt.user_role });

                    // Fetch user profile and permissions in parallel
                    await Promise.all([get().getUserProfile(session.access_token), get().fetchUserPermissions(jwt.user_role)]);
                } catch {
                    set({ ...initialState, loading: false });
                }
            },

            fetchSession: async () => {
                try {
                    const session = await getSession();
                    if (!session) throw new Error("No session found");

                    await get().updateAuthState(session);
                } catch {
                    set({ ...initialState, loading: false });
                }
            },

            hasPermission: (permission) => {
                const { permissions } = get();
                return permissions.includes(permission);
            },

            hasAnyPermission: (permissions) => {
                const { permissions: userPermissions } = get();
                return permissions.some((permission) => userPermissions.includes(permission));
            },

            hasAllPermissions: (permissions) => {
                const { permissions: userPermissions } = get();
                return permissions.every((permission) => userPermissions.includes(permission));
            },

            reset: () => {
                set({ ...initialState, loading: false });
            },
        }),
        { name: "AuthStore" },
    ),
);
