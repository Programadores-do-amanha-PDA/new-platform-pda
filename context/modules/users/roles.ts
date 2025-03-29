import {
  deleteUserRoleWithUserId,
  insertUserRoleWithUserId,
  updateUserRoleWIthUserId,
} from "@/app/actions/roles";
import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

const UserRolesStack = (
  setUsers: Dispatch<SetStateAction<Partial<AuthUserWithProfileType>[]>>
) => {
  const handleAddUserRole = async (userId: string, role: RolesType) => {
    try {
      if (!userId || !role) {
        throw new Error("user id and role fields are required");
      }
      const response = await insertUserRoleWithUserId(userId, role);
      if (!response) throw new Error("no insert user role response");

      setUsers((users) =>
        users.map((user) =>
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
  };

  const handleUpdateUserRole = async (userId: string, role: RolesType) => {
    try {
      if (!userId || !role) {
        throw new Error("role and id fields are required");
      }
      const responseData = await updateUserRoleWIthUserId(userId, role);
      if (!responseData) {
        throw new Error("no update user role data was returned");
      }
      setUsers((users) =>
        users.map((user) =>
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
  };

  const handleDeleteUserRole = async (userId: string) => {
    try {
      if (!userId) throw new Error("role and id fields are required");
      const responseData = await deleteUserRoleWithUserId(userId);
      if (!responseData)
        throw new Error("no update user role data was returned");

      setUsers((users) =>
        users.map((user) =>
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
  };

  return {
    handleAddUserRole,
    handleUpdateUserRole,
    handleDeleteUserRole,
  };
};
export default UserRolesStack;

export interface UserRolesStackI {
  handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  handleUpdateUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  handleDeleteUserRole: (userId: string) => Promise<boolean>;
}
