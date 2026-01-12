import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
import {
  deleteUserRoleWithUserId,
  insertUserRoleWithUserId,
  updateUserRoleWithUserId,
} from "@/actions/user-role";
import { useUsersStore } from "@/features/dashboard/shared/users";
import { Role } from "@/types";

const log = logger.child({ module: "RolesStore" });

/**
 * Props para atualizar o cargo de um usuário.
 */
export type UpdateUserRoleProps = {
  readonly userId: string;
  readonly role: Role;
};

/**
 * Props para remover o cargo de um usuário.
 */
export type DeleteUserRoleProps = {
  readonly userId: string;
};

/**
 * Interface para as ações do store de cargos.
 */
interface UserRolesActions {
  /**
   * Adiciona um novo cargo a um usuário.
   * @param userId ID do usuário.
   * @param role Cargo a ser adicionado.
   * @returns true se sucesso, false caso contrário.
   */
  addUserRole: (userId: string, role: Role) => Promise<boolean>;

  /**
   * Atualiza o cargo de um usuário.
   * @param userId ID do usuário.
   * @param role Novo cargo.
   * @returns true se sucesso, false caso contrário.
   */
  updateUserRole: (userId: string, role: Role) => Promise<boolean>;

  /**
   * Remove o cargo de um usuário.
   * @param userId ID do usuário.
   * @returns true se sucesso, false caso contrário.
   */
  deleteUserRole: (userId: string) => Promise<boolean>;
}

export const useRolesStore = create<UserRolesActions>()(
  devtools(
    () => ({
      addUserRole: async (userId: string, role: Role) => {
        try {
          if (!userId) {
            log.warn({ operation: "addUserRole" }, "User ID is required");
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          if (!role) {
            log.warn({ operation: "addUserRole" }, "Role is required");
            toast.error("Função do usuário é obrigatória");
            return false;
          }

          const response = await insertUserRoleWithUserId({ userId, role });
          if (!response) throw new Error("no insert user role response");

          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          const updatedUsers = usersStore.users.map((user) =>
            user.id === userId && user.profile
              ? {
                  ...user,
                  profile: {
                    ...user.profile,
                    id: user.profile.id || "",
                    user_role: { role: role },
                  },
                }
              : user
          );

          usersStore.setUsers({ users: updatedUsers });
          toast.success("Cargo adicionado com sucesso!");
          return true;
        } catch (error) {
          if (error instanceof Error) {
            log.error({ err: error, userId, role: role, operation: "addUserRole" }, "Error adding user role");
          }
          toast.error("Erro ao adicionar cargo ao usuário!");
          return false;
        }
      },

      updateUserRole: async (userId: string, role: Role) => {
        try {
          if (!userId) {
            log.warn({ operation: "updateUserRole" }, "User ID is required");
            toast.error("ID do usuário é obrigatório");
            return false;
          }
          if (!role) {
            log.warn({ operation: "updateUserRole" }, "Role is required");
            toast.error("Função do usuário é obrigatória");
            return false;
          }

          const responseData = await updateUserRoleWithUserId({ userId, newRole: role });
          if (!responseData) throw new Error("no update user role response");

          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          const updatedUsers = usersStore.users.map((user) =>
            user.id === userId && user.profile
              ? {
                  ...user,
                  profile: {
                    ...user.profile,
                    user_role: { role },
                  },
                }
              : user
          );

          usersStore.setUsers({ users: updatedUsers });
          toast.success("Cargo atualizado com sucesso!");
          return true;
        } catch (error) {
          if (error instanceof Error) {
            log.error({ err: error, userId, role: role, operation: "updateUserRole" }, "Error updating user role");
          }
          toast.error("Erro ao atualizar cargo do usuário!");
          return false;
        }
      },

      deleteUserRole: async (userId: string) => {
        try {
          if (!userId) {
            log.warn({ operation: "deleteUserRole" }, "User ID is required");
            toast.error("ID do usuário é obrigatório");
            return false;
          }

          const responseData = await deleteUserRoleWithUserId({ userId });
          if (!responseData) throw new Error("no delete user role response");

          // Update the users in the users store
          const usersStore = useUsersStore.getState();
          const updatedUsers = usersStore.users.map((user) =>
            user.id === userId && user.profile
              ? {
                  ...user,
                  profile: {
                    ...user.profile,
                    user_role: { role: "" as Role },
                  },
                }
              : user
          );

          usersStore.setUsers({ users: updatedUsers });
          toast.success("Cargo removido com sucesso!");
          return true;
        } catch (error) {
          if (error instanceof Error) {
            log.error({ err: error, userId, operation: "deleteUserRole" }, "Error deleting user role");
          }
          toast.error("Erro ao remover cargo do usuário!");
          return false;
        }
      },
    }),
    { name: "RolesStore" }
  )
);