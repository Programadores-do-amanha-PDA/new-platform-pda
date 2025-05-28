import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/app/actions/auth_admin";
import { getManyAvatarUrlsByIds } from "@/app/actions/profile-avatar";
import { getProfileById } from "@/app/actions/profiles";
import { AuthUserWithProfileType, RolesType } from "@/types/auth-types";
import { AuthUser } from "@supabase/supabase-js";
import { useState } from "react";
import { toast } from "sonner";

const UsersStack = () => {
  const [users, setUsers] = useState<Partial<AuthUserWithProfileType>[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllUsersWithProfiles = async (role?: RolesType) => {
    try {
      setLoading(true);
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

      setUsers(usersWithAvatars);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewUser = async (
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

      setUsers((users) => [
        ...users,
        { ...userResponse, profile: userProfileResponse },
      ]);
      toast.success("Novo usuário criado com sucesso!");
      return userResponse.id;
    } catch (error) {
      toast.error("Erro ao criar novo usuário!");
      console.log(error);
      return false;
    }
  };

  const handleUpdateUser = async (
    userID: string | undefined,
    updates: Partial<AuthUser & { password: string }>
  ) => {
    try {
      if (!userID || !updates) {
        throw new Error("id and updates fields are required");
      }

      const userUpdatedResponse = await updateUser(userID, updates);
      if (!userUpdatedResponse) throw new Error("no update user response");

      setUsers((users) =>
        users.map((currentUser) => {
          if (currentUser.id === userID) {
            const userUpdatedData: AuthUserWithProfileType = {
              ...currentUser,
              ...userUpdatedResponse,
              profile: {
                ...currentUser.profile,
                email: userUpdatedResponse.user_metadata.user_email as string,
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
        })
      );
      toast.success("Usuário atualizado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar o usuário!");
      return false;
    }
  };

  const handleDeleteUser = async (userId: string | undefined) => {
    try {
      if (!userId) throw new Error("user id is required to delete");

      const response = await deleteUser(userId);
      if (!response) throw new Error("no delete user response");

      setUsers((users) => users.filter((user) => user.id !== userId));
      toast.success("Usuário deletado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar usuário. tente novamente mais tarde!");
      return false;
    }
  };

  return {
    users,
    setUsers,
    usersLoading: loading,
    handleGetAllUsersWithProfiles,
    handleCreateNewUser,
    handleUpdateUser,
    handleDeleteUser,
  };
};

export default UsersStack;

export interface UsersStackI {
  users: Partial<AuthUserWithProfileType>[];
  usersLoading: boolean;
  handleGetAllUsersWithProfiles: (role?: RolesType) => Promise<boolean>;
  handleCreateNewUser: (
    user: Partial<AuthUser & { password: string }>
  ) => Promise<string | false>;
  handleUpdateUser: (
    userID: string,
    user: Partial<AuthUser & { password: string }>
  ) => Promise<boolean>;
  handleDeleteUser: (userId: string) => Promise<boolean>;
}
