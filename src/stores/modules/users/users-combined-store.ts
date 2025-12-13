import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { AuthUser } from "@supabase/supabase-js";

import { AuthUserWithProfileT, RolesT, UserClassroomT } from "@/types";
import { useUsersStore } from "./users-store";
import { useRolesStore } from "./user-role.store";
import { useUserClassroomsStore } from "./user-classrooms-store";

/**
 * Combined store that provides access to all user-related functionality
 * This store doesn't duplicate state but provides a unified API to access
 * all user-related operations from the individual stores
 */

// Types for better type safety
export type GetAllUsersWithProfilesProps = {
  role?: RolesT;
};

export type CreateNewUserProps = {
  userData: Partial<AuthUser & { password: string }>;
};

export type UpdateUserProps = {
  userID: string;
  updates: Partial<AuthUser & { password: string }>;
};

export type DeleteUserProps = {
  userId: string;
};

export type CreateUserClassroomsProps = {
  usersClassrooms: Omit<UserClassroomT, "short_id" | "mode">[];
};

export type DeleteUserClassroomProps = {
  userId: string;
  classroomsIds: string[];
};

export type AddUserRoleProps = {
  userId: string;
  role: RolesT;
};

export type UpdateUserRoleProps = {
  userId: string;
  role: RolesT;
};

export type DeleteUserRoleProps = {
  userId: string;
};

interface UsersCombinedState {
  // Getters for accessing state from individual stores
  getUsers: () => Partial<AuthUserWithProfileT>[];
  isLoading: () => boolean;
}

interface UsersCombinedActions {
  // User management actions
  getAllUsersWithProfiles: (props?: GetAllUsersWithProfilesProps) => Promise<boolean>;
  createNewUser: (props: CreateNewUserProps) => Promise<string | false>;
  updateUser: (props: UpdateUserProps) => Promise<boolean>;
  deleteUser: (props: DeleteUserProps) => Promise<boolean>;

  // User classroom actions
  createUserClassrooms: (props: CreateUserClassroomsProps) => Promise<boolean>;
  deleteUserClassroom: (props: DeleteUserClassroomProps) => Promise<boolean>;

  // User role actions
  addUserRole: (props: AddUserRoleProps) => Promise<boolean>;
  updateUserRole: (props: UpdateUserRoleProps) => Promise<boolean>;
  deleteUserRole: (props: DeleteUserRoleProps) => Promise<boolean>;

  // Reset all stores
  resetAll: () => void;
}

export const useUsersCombinedStore = create<
  UsersCombinedState & UsersCombinedActions
>()(
  devtools(
    () => ({
      // Getters
      getUsers: () => useUsersStore.getState().users,
      isLoading: () =>
        useUsersStore.getState().loading ||
        useUserClassroomsStore.getState().loading,

      // User management actions
      getAllUsersWithProfiles: async (props?: GetAllUsersWithProfilesProps) => {
        try {
          const success = await useUsersStore
            .getState()
            .getAllUsersWithProfiles(props);
          
          if (success) {
            // Sync users data with the classrooms store
            const users = useUsersStore.getState().users;
            useUserClassroomsStore.getState().setUsers(users);
          }
          return success;
        } catch (error) {
          console.error("Error in getAllUsersWithProfiles:", error);
          toast.error("Erro ao buscar usuários. Tente novamente mais tarde!");
          return false;
        }
      },

      createNewUser: async ({ userData }: CreateNewUserProps) => {
        try {
          if (!userData) {
            toast.error("Dados do usuário são obrigatórios");
            return false;
          }
          return await useUsersStore.getState().createNewUser({ userData });
        } catch (error) {
          console.error("Error in createNewUser:", error);
          toast.error("Erro ao criar usuário. Tente novamente mais tarde!");
          return false;
        }
      },

      updateUser: async ({ userID, updates }: UpdateUserProps) => {
        try {
          if (!userID) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          if (!updates) {
            toast.error("Dados para atualização são obrigatórios");
            return false;
          }
          return await useUsersStore.getState().updateUser({ userID, updates });
        } catch (error) {
          console.error("Error in updateUser:", error);
          toast.error("Erro ao atualizar usuário. Tente novamente mais tarde!");
          return false;
        }
      },

      deleteUser: async ({ userId }: DeleteUserProps) => {
        try {
          if (!userId) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          return await useUsersStore.getState().deleteUser({ userId });
        } catch (error) {
          console.error("Error in deleteUser:", error);
          toast.error("Erro ao deletar usuário. Tente novamente mais tarde!");
          return false;
        }
      },

      // User classroom actions
      createUserClassrooms: async ({ usersClassrooms }: CreateUserClassroomsProps) => {
        try {
          if (!usersClassrooms || usersClassrooms.length === 0) {
            toast.error("Dados das salas de aula são obrigatórios");
            return false;
          }

          const success = await useUserClassroomsStore
            .getState()
            .createUserClassrooms(usersClassrooms);
          
          if (success) {
            // Sync updated classroom data back to users store
            const updatedUsers = useUserClassroomsStore.getState().users;
            useUsersStore.getState().setUsers({ users: updatedUsers });
          }
          return success;
        } catch (error) {
          console.error("Error in createUserClassrooms:", error);
          toast.error("Erro ao criar salas de aula do usuário. Tente novamente mais tarde!");
          return false;
        }
      },

      deleteUserClassroom: async ({ userId, classroomsIds }: DeleteUserClassroomProps) => {
        try {
          if (!userId) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          if (!classroomsIds || classroomsIds.length === 0) {
            toast.error("IDs das salas de aula são obrigatórios");
            return false;
          }

          const success = await useUserClassroomsStore
            .getState()
            .deleteUserClassroom(userId, classroomsIds);
          
          if (success) {
            // Sync updated classroom data back to users store
            const updatedUsers = useUserClassroomsStore.getState().users;
            useUsersStore.getState().setUsers({ users: updatedUsers });
          }
          return success;
        } catch (error) {
          console.error("Error in deleteUserClassroom:", error);
          toast.error("Erro ao remover usuário da sala de aula. Tente novamente mais tarde!");
          return false;
        }
      },

      // User role actions
      addUserRole: async ({ userId, role }: AddUserRoleProps) => {
        try {
          if (!userId) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          if (!role) {
            toast.error("Função do usuário é obrigatória");
            return false;
          }
          return await useRolesStore.getState().addUserRole(userId, role);
        } catch (error) {
          console.error("Error in addUserRole:", error);
          toast.error("Erro ao adicionar função ao usuário. Tente novamente mais tarde!");
          return false;
        }
      },

      updateUserRole: async ({ userId, role }: UpdateUserRoleProps) => {
        try {
          if (!userId) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          if (!role) {
            toast.error("Função do usuário é obrigatória");
            return false;
          }
          return await useRolesStore.getState().updateUserRole(userId, role);
        } catch (error) {
          console.error("Error in updateUserRole:", error);
          toast.error("Erro ao atualizar função do usuário. Tente novamente mais tarde!");
          return false;
        }
      },

      deleteUserRole: async ({ userId }: DeleteUserRoleProps) => {
        try {
          if (!userId) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          return await useRolesStore.getState().deleteUserRole(userId);
        } catch (error) {
          console.error("Error in deleteUserRole:", error);
          toast.error("Erro ao remover função do usuário. Tente novamente mais tarde!");
          return false;
        }
      },

      // Reset all stores
      resetAll: () => {
        try {
          useUsersStore.getState().reset();
          useUserClassroomsStore.getState().reset();
        } catch (error) {
          console.error("Error in resetAll:", error);
          toast.error("Erro ao resetar dados. Tente novamente mais tarde!");
        }
      },
    }),
    { name: "UsersCombinedStore" }
  )
);
