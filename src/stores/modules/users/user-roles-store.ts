import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import {
  deleteUserRoleWithUserId,
  insertUserRoleWithUserId,
  updateUserRoleWIthUserId,
} from "@/app/actions/roles";
import { useUsersStore } from "./users-store";
import { RolesT } from "@/types/auth";

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
          if (!userId || !role) {
            throw new Error("user id and role fields are required");
          }
          const response = await insertUserRoleWithUserId(userId, role);
          if (!response) throw new Error("no insert user role response");

          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          usersStore.setUsers(
            usersStore.users.map((user) =>
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
            )
          );
          
          toast.success("Cargo adicionado com sucesso!");
          return true;
        } catch (error) {
          console.log(error);
          toast.error("Erro ao adicionar cargo ao usuário!");
          return false;
        }
      },

      updateUserRole: async (userId: string, role: RolesT) => {
        try {
          if (!userId || !role) {
            throw new Error("role and id fields are required");
          }
          const responseData = await updateUserRoleWIthUserId(userId, role);
          if (!responseData) {
            throw new Error("no update user role data was returned");
          }
          
          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          usersStore.setUsers(
            usersStore.users.map((user) =>
              user.id === userId && user.profile
                ? {
                    ...user,
                    profile: {
                      ...user.profile,
                      user_roles: [{ role }],
                    },
                  }
                : user
            )
          );
          
          toast.success("Cargo atualizado com sucesso!");
          return true;
        } catch (error) {
          console.log(error);
          toast.error("Erro ao atualizar cargo do usuário!");
          return false;
        }
      },

      deleteUserRole: async (userId: string) => {
        try {
          if (!userId) throw new Error("role and id fields are required");
          const responseData = await deleteUserRoleWithUserId(userId);
          if (!responseData)
            throw new Error("no update user role data was returned");

          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          usersStore.setUsers(
            usersStore.users.map((user) =>
              user.id === userId && user.profile
                ? {
                    ...user,
                    profile: {
                      ...user.profile,
                      user_roles: [],
                    },
                  }
                : user
            )
          );
          
          toast.success("Cargo removido com sucesso!");
          return true;
        } catch (error) {
          console.log(error);
          toast.error("Erro ao remover cargo do usuário!");
          return false;
        }
      },
    }),
    { name: "RolesStore" }
  )
);