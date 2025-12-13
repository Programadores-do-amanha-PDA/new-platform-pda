import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { getAllUsers, getManyAvatarUrlsByIds, createUser, getProfileById, updateUser, deleteUser } from "@/actions";
import {
    AuthUserWithProfileT,
    CreateNewUserProps,
    DeleteUserStoreProps,
    GetAllUsersWithProfilesProps,
    IUsersActions,
    IUsersState,
    ProfileT,
    SetUsersProps,
    UpdateUserStoreProps,
} from "@/types";

const initialState: IUsersState = {
    users: [],
    loading: false,
};

export const useUsersStore = create<IUsersState & IUsersActions>()(
    devtools(
        (set) => ({
            ...initialState,

            setUsers: ({ users }: SetUsersProps) => {
                if (!users) {
                    console.error("Invalid users data");
                    return;
                }
                set({ users });
            },

            getAllUsersWithProfiles: async (props?: GetAllUsersWithProfilesProps) => {
                set({ loading: true });

                try {
                    const role = props?.role;
                    const users = await getAllUsers({ role });
                    if (!users) throw new Error("Failed to fetch users");

                    const usersAvatars = await getManyAvatarUrlsByIds(users.map((user) => user.id));
                    const usersWithAvatars = users.map((user) => ({
                        ...user,
                        profile: {
                            ...user.profile,
                            avatar_url:
                                usersAvatars?.find((avatar) => avatar.path === `${user.id}/avatar.png`)?.signedUrl ?? null,
                        },
                    }));

                    set({ users: usersWithAvatars });
                    return true;
                } catch (error) {
                    console.error("Error fetching users with profiles:", error);
                    toast.error("Erro ao buscar usuários. Tente novamente mais tarde!");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

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

                    const userProfileResponse = await getProfileById({ id: userResponse.id });
                    if (!userProfileResponse) throw new Error("Failed to fetch user profile");

                    const userWithProfile: Partial<AuthUserWithProfileT> = {
                        ...userResponse,
                        profile: {
                            ...userProfileResponse,
                            classrooms: userProfileResponse.classrooms || [],
                        },
                    };

                    set((state) => ({
                        users: [...state.users, userWithProfile],
                    }));
                    toast.success("Novo usuário criado com sucesso!");
                    return userResponse.id;
                } catch (error) {
                    console.error("Error creating new user:", error);
                    toast.error("Erro ao criar novo usuário!");
                    return false;
                }
            },

            updateUser: async ({ userID, updates }: UpdateUserStoreProps) => {
                try {
                    if (!userID) throw new Error("Invalid user ID");
                    if (!updates) throw new Error("Invalid update data");

                    const userUpdatedResponse = await updateUser({ userId: userID, updates });
                    if (!userUpdatedResponse) throw new Error("Failed to update user");

                    set((state) => ({
                        users: state.users.map((currentUser) => {
                            if (currentUser.id === userID) {
                                const userUpdatedData: AuthUserWithProfileT = {
                                    ...currentUser,
                                    ...userUpdatedResponse,
                                    profile: {
                                        ...(currentUser.profile as ProfileT),
                                        email: userUpdatedResponse.user_metadata.user_email as string,
                                        full_name: userUpdatedResponse.user_metadata.full_name as string,
                                    },
                                    user_metadata: {
                                        ...currentUser.user_metadata,
                                        ...userUpdatedResponse.user_metadata,
                                    },
                                };

                                return userUpdatedData;
                            }
                            return currentUser;
                        }),
                    }));
                    toast.success("Usuário atualizado com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error updating user:", error);
                    toast.error("Erro ao atualizar o usuário!");
                    return false;
                }
            },

            deleteUser: async ({ userId }: DeleteUserStoreProps) => {
                try {
                    if (!userId) throw new Error("Invalid user ID");

                    const response = await deleteUser({ userId });
                    if (!response) throw new Error("Failed to delete user");

                    set((state) => ({
                        users: state.users.filter((user) => user.id !== userId),
                    }));
                    toast.success("Usuário deletado com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error deleting user:", error);
                    toast.error("Erro ao deletar usuário. Tente novamente mais tarde!");
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "UsersStore" },
    ),
);
