import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { AuthUser } from "@supabase/supabase-js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/app/actions/auth_admin";
import { getManyAvatarUrlsByIds } from "@/app/actions/profile-avatar";
import { getProfileById } from "@/app/actions/profiles";
import { AuthUserWithProfileT, ProfileT, RolesT } from "@/types/auth";

interface UsersState {
  users: Partial<AuthUserWithProfileT>[];
  loading: boolean;
}

interface UsersActions {
  setUsers: (users: Partial<AuthUserWithProfileT>[]) => void;
  getAllUsersWithProfiles: (role?: RolesT) => Promise<boolean>;
  createNewUser: (
    userData: Partial<AuthUser & { password: string }>
  ) => Promise<string | false>;
  updateUser: (
    userID: string | undefined,
    updates: Partial<AuthUser & { password: string }>
  ) => Promise<boolean>;
  deleteUser: (userId: string | undefined) => Promise<boolean>;
  reset: () => void;
}

const initialState: UsersState = {
  users: [],
  loading: false,
};

export const useUsersStore = create<UsersState & UsersActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setUsers: (users) => set({ users }),

      getAllUsersWithProfiles: async (role?: RolesT) => {
        try {
          set({ loading: true });
          const users = await getAllUsers(role);
          if (!users) throw "no users response";

          const usersAvatars = await getManyAvatarUrlsByIds(
            users.map((user) => user.id)
          );
          const usersWithAvatars = users.map((user) => ({
            ...user,
            profile: {
              ...user.profile,
              avatarUrl:
                usersAvatars?.find(
                  (avatar) => avatar.path === `${user.id}/avatar.png`
                )?.signedUrl ?? null,
            },
          }));

          set({ users: usersWithAvatars });
          return true;
        } catch (error) {
          console.error(error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createNewUser: async (
        userData: Partial<AuthUser & { password: string }>
      ) => {
        try {
          if (
            !userData.email ||
            !userData.password ||
            !userData.user_metadata ||
            !userData.user_metadata.full_name ||
            !userData.user_metadata.user_email
          ) {
            throw new Error("invalid user data");
          }

          const userResponse = await createUser(userData);
          if (!userResponse) throw new Error("no user response");

          const userProfileResponse = await getProfileById(userResponse.id);
          if (!userProfileResponse) throw new Error("no user profile response");

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
          toast.error("Erro ao criar novo usuário!");
          console.error(error);
          return false;
        }
      },

      updateUser: async (
        userID: string | undefined,
        updates: Partial<AuthUser & { password: string }>
      ) => {
        try {
          if (!userID || !updates) {
            throw new Error("id and updates fields are required");
          }

          const userUpdatedResponse = await updateUser(userID, updates);
          if (!userUpdatedResponse) throw new Error("no update user response");

          set((state) => ({
            users: state.users.map((currentUser) => {
              if (currentUser.id === userID) {
                const userUpdatedData: AuthUserWithProfileT = {
                  ...currentUser,
                  ...userUpdatedResponse,
                  profile: {
                    ...(currentUser.profile as ProfileT),
                    email: userUpdatedResponse.user_metadata
                      .user_email as string,
                    full_name: userUpdatedResponse.user_metadata
                      .full_name as string,
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
          console.error(error);
          toast.error("Erro ao atualizar o usuário!");
          return false;
        }
      },

      deleteUser: async (userId: string | undefined) => {
        try {
          if (!userId) throw new Error("user id is required to delete");

          const response = await deleteUser(userId);
          if (!response) throw new Error("no delete user response");

          set((state) => ({
            users: state.users.filter((user) => user.id !== userId),
          }));
          toast.success("Usuário deletado com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao deletar usuário. tente novamente mais tarde!");
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "UsersStore" }
  )
);
