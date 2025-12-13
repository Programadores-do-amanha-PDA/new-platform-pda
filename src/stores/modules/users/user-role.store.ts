import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import {
  deleteUserRoleWithUserId,
  insertUserRoleWithUserId,
  updateUserRoleWithUserId,
} from "@/actions/user-role.actions";
import { useUsersStore } from "./users-store";
import { RolesT } from "@/types/auth";

// Types for better type safety
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

interface UserRolesActions {
  addUserRole: (userId: string, role: RolesT) => Promise<boolean>;
  updateUserRole: (userId: string, role: RolesT) => Promise<boolean>;
  deleteUserRole: (userId: string) => Promise<boolean>;
}

export const useRolesStore = create<UserRolesActions>()(
  devtools(
    () => ({
      addUserRole: async (userId: string, role: RolesT) => {
        try {
          if (!userId) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          if (!role) {
            toast.error("Função do usuário é obrigatória");
            return false;
          }

          const response = await insertUserRoleWithUserId({ userId, role });
          if (!response) throw new Error("Failed to insert user role");

          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          const updatedUsers = usersStore.users.map((user) =>
            user.id === userId && user.profile
              ? {
                  ...user,
                  profile: {
                    ...user.profile,
                    id: user.profile.id || "",
                    user_roles: [{ role: role }],
                  },
                }
              : user
          );
          
          usersStore.setUsers({ users: updatedUsers });
          toast.success("Cargo adicionado com sucesso!");
          return true;
        } catch (error) {
          console.error("Error adding user role:", error);
          toast.error("Erro ao adicionar cargo ao usuário!");
          return false;
        }
      },

      updateUserRole: async (userId: string, role: RolesT) => {
        try {
          if (!userId) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          if (!role) {
            toast.error("Função do usuário é obrigatória");
            return false;
          }

          const responseData = await updateUserRoleWithUserId({ userId, newRole: role });
          if (!responseData) throw new Error("Failed to update user role");
          
          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          const updatedUsers = usersStore.users.map((user) =>
            user.id === userId && user.profile
              ? {
                  ...user,
                  profile: {
                    ...user.profile,
                    user_roles: [{ role }],
                  },
                }
              : user
          );
          
          usersStore.setUsers({ users: updatedUsers });
          toast.success("Cargo atualizado com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating user role:", error);
          toast.error("Erro ao atualizar cargo do usuário!");
          return false;
        }
      },

      deleteUserRole: async (userId: string) => {
        try {
          if (!userId) {
            toast.error("ID do usuário é obrigatório");
            return false;
          }

          const responseData = await deleteUserRoleWithUserId({ userId });
          if (!responseData) throw new Error("Failed to delete user role");

          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          const updatedUsers = usersStore.users.map((user) =>
            user.id === userId && user.profile
              ? {
                  ...user,
                  profile: {
                    ...user.profile,
                    user_roles: [],
                  },
                }
              : user
          );
          
          usersStore.setUsers({ users: updatedUsers });
          toast.success("Cargo removido com sucesso!");
          return true;
        } catch (error) {
          console.error("Error deleting user role:", error);
          toast.error("Erro ao remover cargo do usuário!");
          return false;
        }
      },
    }),
    { name: "RolesStore" }
  )
);