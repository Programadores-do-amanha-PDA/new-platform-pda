import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/lib/toast";

import { logger } from "@/lib/logger";

import { createUser, updateUser, deleteUser } from "./actions/users-admin";
import { Role } from "@/features/auth/access-control/types";
import { getAllUsersDataByRoleAsync } from "./actions/full-user-data";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { ProfileWithRelations, AdminUserAttributes } from "./types/user";
import { getProfileById } from "../profile/actions/profile";

interface UsersState {
    readonly users: ProfileWithRelations[];
    readonly loading: boolean;
}

type SetUsersProps = {
    readonly users: ProfileWithRelations[];
};

type FetchAllUsersWithProfilesProps = {
    readonly role?: Role;
};

type CreateNewUserProps = {
    userData: AdminUserAttributes;
};

type UpdateUserByIdProps = {
    id: string;
    updates: AdminUserAttributes;
};

type DeleteUserByIdProps = {
    id: string;
};

interface UsersActions {
    setUsers: ({ users }: SetUsersProps) => void;
    fetchAllUsersWithProfiles: ({ role }: FetchAllUsersWithProfilesProps) => Promise<boolean>;
    createNewUser: ({ userData }: CreateNewUserProps) => Promise<string | false>;
    updateUser: (props: UpdateUserByIdProps) => Promise<boolean>;
    deleteUser: (props: DeleteUserByIdProps) => Promise<boolean>;
    reset: () => void;
}

const log = logger.child({ module: "UsersStore" });

const initialState: UsersState = {
    users: [],
    loading: false,
};

export const useUsersStore = create<UsersState & UsersActions>()(
    devtools(
        (set) => ({
            ...initialState,

            /**
             * Popula o estado com os usuários recebidos.
             * @param users Array de usuários com perfis.
             */
            setUsers: ({ users }: SetUsersProps) => {
                if (!users) {
                    log.warn({ operation: "setUsers" }, "Invalid users data");
                    return;
                }
                set({ users });
            },

            /**
             * Busca todos os usuários com seus perfis.
             * @param role Role opcional para filtrar usuários.
             * @returns true se sucesso, false caso contrário.
             */
            fetchAllUsersWithProfiles: async ({ role }: FetchAllUsersWithProfilesProps) => {
                try {
                    set({ loading: true });

                    const { data, error } = await getAllUsersDataByRoleAsync({ role });
                    if (error) throw new Error(error);
                    if (!data) throw new Error("no get all users response");

                    set({ users: data.profiles });
                    useEnrollmentsManagementStore
                        .getState()
                        .setEnrollmentsByUserId({ enrollmentsByUserId: data.enrollmentsByUserId });

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, operation: "fetchAllUsersWithProfiles" }, "Error fetching users with profiles");
                    }
                    toast.error({
                        title: "Erro ao buscar usuários",
                        description: "Ocorreu um erro ao buscar os usuários. Tente novamente mais tarde!",
                    });
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            /**
             * Cria um novo usuário.
             * @param userData Dados do usuário a ser criado.
             * @returns ID do usuário criado se sucesso, false caso contrário.
             */
            createNewUser: async ({ userData }: CreateNewUserProps) => {
                try {
                    if (!userData) throw new Error("Invalid user data");
                    if (
                        !userData.email ||
                        !userData.password ||
                        !userData.user_metadata ||
                        !userData.user_metadata.full_name ||
                        !userData.user_metadata.user_email
                    ) {
                        throw new Error("Missing required user data fields");
                    }

                    const userResponse = await createUser({ userData });
                    if (!userResponse) throw new Error("Failed to create user");

                    const { data, error } = await getProfileById({ id: userResponse.id });
                    if (error) throw new Error(error);
                    if (!data) throw new Error("No profile data returned");

                    set((state) => ({
                        users: [...state.users, { ...data.profile }],
                    }));
                    toast.success({
                        title: "Novo usuário criado com sucesso",
                        description: "O usuário foi criado com sucesso!",
                    });

                    return userResponse.id;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, operation: "createNewUser" }, "Error creating new user");
                    }
                    toast.error({
                        title: "Erro ao criar novo usuário",
                        description: "Ocorreu um erro ao criar o usuário. Tente novamente mais tarde!",
                    });
                    return false;
                }
            },

            /**
             * Atualiza um usuário específico.
             * @param id ID do usuário a ser atualizado.
             * @param updates Objeto com os campos a serem atualizados.
             * @returns true se sucesso, false caso contrário.
             */
            updateUser: async ({ id, updates }: UpdateUserByIdProps) => {
                try {
                    if (!id) throw new Error("Invalid user ID");
                    if (!updates) throw new Error("Invalid update data");

                    const userUpdatedResponse = await updateUser({ id, updates });
                    if (!userUpdatedResponse) throw new Error("Failed to update user");

                    set((state) => ({
                        users: state.users.map((profile) => {
                            if (profile.id === id) {
                                return {
                                    ...profile,
                                    full_name: userUpdatedResponse.user_metadata.full_name as string,
                                };
                            }
                            return profile;
                        }),
                    }));
                    toast.success({
                        title: "Usuário atualizado com sucesso",
                        description: "O usuário foi atualizado com sucesso!",
                    });
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, operation: "updateUser" }, "Error updating user");
                    }
                    toast.error({
                        title: "Erro ao atualizar usuário",
                        description: "Ocorreu um erro ao atualizar o usuário. Tente novamente mais tarde!",
                    });
                    return false;
                }
            },

            /**
             * Deleta um usuário específico.
             * @param id ID do usuário a ser deletado.
             * @returns true se sucesso, false caso contrário.
             */
            deleteUser: async ({ id }: DeleteUserByIdProps) => {
                try {
                    if (!id) throw new Error("Invalid user ID");

                    const response = await deleteUser({ id });
                    if (!response) throw new Error("Failed to delete user");

                    set((state) => ({
                        users: state.users.filter((profile) => profile.id !== id),
                    }));
                    toast.success({
                        title: "Usuário deletado com sucesso",
                        description: "O usuário foi deletado com sucesso!",
                    });
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, operation: "deleteUser" }, "Error deleting user");
                    }
                    toast.error({
                        title: "Erro ao deletar usuário",
                        description: "Ocorreu um erro ao deletar o usuário. Tente novamente mais tarde!",
                    });
                    return false;
                }
            },

            /**
             * Reseta o estado da store para o estado inicial.
             */
            reset: () => {
                set(initialState);
            },
        }),
        { name: "UsersStore" },
    ),
);
