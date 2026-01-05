"Use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

import { getAuthUser, getSession, getPermissionsByRole } from "@/actions";
import { logger } from "@/lib/logger";

import { JwtPayloadT } from "@/types";
import { getProfileById, Profile } from "@/features/dashboard/shared/profile";
import { AuthState, AuthActions } from "./types";

const log = logger.child({ module: "AuthStore" });

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
             * Busca as permissões do usuário baseado em seu cargo.
             * @param role O cargo do usuário.
             */
            fetchUserPermissions: async (role) => {
                try {
                    const permissions = await getPermissionsByRole(role);
                    set({ permissions });
                } catch (error) {
                    set({ permissions: [] });
                    log.warn({ err: error, role, operation: "fetchUserPermissions" }, "Error fetching permissions");
                }
            },

            /**
             * Busca o perfil completo do usuário.
             * @param jwt Token JWT contendo informações do usuário.
             */
            fetchUserProfile: async (jwt) => {
                try {
                    if (!jwt) {
                        throw new Error("JWT not provided");
                    }

                    const user = await getAuthUser(jwt);
                    if (!user?.id) {
                        set({ user: null, loading: false });
                        return;
                    }

                    const [userProfile] = await Promise.all([getProfileById({ id: user.id })]);

                    if (!userProfile) {
                        throw new Error("User profile not found");
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
                } catch (error) {
                    set({
                        user: null,
                        permissions: [],
                        loading: false,
                    });
                    log.error({ err: error, operation: "fetchUserProfile" }, "Error fetching user profile");
                }
            },

            /**
             * Atualiza o estado de autenticação com base na sessão.
             * @param session Sessão do usuário contendo access_token.
             */
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

                    // Fetch user profile and permissions in parallel
                    await Promise.all([
                        get().fetchUserProfile(session.access_token),
                        get().fetchUserPermissions(jwt.user_role),
                    ]);
                } catch (error) {
                    log.debug({ err: error, operation: "updateAuthState" }, "Error updating auth state");
                    set({ ...initialState, loading: false });
                }
            },

            /**
             * Busca a sessão atual do usuário e atualiza o estado de autenticação.
             */
            fetchSession: async () => {
                try {
                    const session = await getSession();
                    if (!session) throw new Error("No session found");

                    await get().updateAuthState(session);
                } catch (error) {
                    set({ ...initialState, loading: false });
                    log.warn({ err: error, operation: "fetchSession" }, "Error fetching session");
                }
            },

            /**
             * Verifica se o usuário possui uma permissão específica.
             * @param permission A permissão a ser verificada.
             * @returns true se o usuário possui a permissão, false caso contrário.
             */
            hasPermission: (permission) => {
                const { permissions } = get();
                return permissions.includes(permission);
            },

            /**
             * Verifica se o usuário possui qualquer uma das permissões fornecidas.
             * @param permissions Array de permissões a serem verificadas.
             * @returns true se o usuário possui pelo menos uma das permissões, false caso contrário.
             */
            hasAnyPermission: (permissions) => {
                const { permissions: userPermissions } = get();
                return permissions.some((permission) => userPermissions.includes(permission));
            },

            /**
             * Verifica se o usuário possui todas as permissões fornecidas.
             * @param permissions Array de permissões a serem verificadas.
             * @returns true se o usuário possui todas as permissões, false caso contrário.
             */
            hasAllPermissions: (permissions) => {
                const { permissions: userPermissions } = get();
                return permissions.every((permission) => userPermissions.includes(permission));
            },

            /**
             * Reseta o estado de autenticação para o estado inicial.
             */
            reset: () => {
                set({ ...initialState, loading: false });
            },
        }),
        { name: "AuthStore" },
    ),
);
