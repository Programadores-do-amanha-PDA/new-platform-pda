import {
  insertUserClassroom,
  deleteUserClassroom,
} from "@/app/actions/user-classroom";
import { AuthUserWithProfileType, ProfileType } from "@/types/auth";
import { UserClassroomT } from "@/types/user-classroom";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

const UserClassroomStack = (
  setUsers: Dispatch<SetStateAction<Partial<AuthUserWithProfileType>[]>>
) => {
  const handleInsertUserClassrooms = async (
    usersClassrooms: UserClassroomT[]
  ) => {
    try {
      if (!usersClassrooms.length) {
        toast.error("Nenhum usuário selecionado para vincular à turma!");
        throw new Error("empty users classroom array");
      }
      const response = await insertUserClassroom(usersClassrooms);
      if (!response) throw new Error("No insert user classroom response");

      setUsers((prev) =>
        prev.map((user) => {
          if (!user) return user;

          const newClassrooms = response
            .filter((uc) => uc.user_id === user.id)
            .map((uc) => uc.classroom_id);

          return {
            ...user,
            profile: {
              ...(user.profile || ({} as ProfileType)),
              classrooms: [
                ...(user.profile?.classrooms || []),
                ...newClassrooms,
              ],
            },
          };
        })
      );

      toast.success(`${response.length} vínculo(s) criado(s) com sucesso!`);
      return true;
    } catch (error) {
      toast.error("Erro ao vincular usuários à turma!");
      console.error(error);
      return false;
    }
  };

  const handleDeleteUserClassroom = async (
    userId: string,
    classroomsIds: string[]
  ) => {
    try {
      if (!userId || !classroomsIds.length) {
        throw new Error("user id and classroom id are required");
      }
      const response = await deleteUserClassroom(userId, classroomsIds);
      if (!response) throw new Error("no delete user classroom response");

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                profile: {
                  ...(user.profile || ({} as ProfileType)),
                  classrooms: [
                    ...(user.profile?.classrooms || []),
                    ...(user.profile?.classrooms?.filter(
                      (uc) => !classroomsIds.includes(uc.classroom_id)
                    ) || []),
                  ],
                },
              }
            : user
        )
      );

      toast.success("Vínculo usuário-turma removido com sucesso!");
      return true;
    } catch (error) {
      toast.error("Erro ao remover vínculo usuário-turma!");
      console.error(error);
      return false;
    }
  };

  return {
    handleInsertUserClassrooms,
    handleDeleteUserClassroom,
  };
};

export default UserClassroomStack;

export interface UserClassroomStackI {
  handleInsertUserClassrooms: (
    usersClassrooms: UserClassroomT[]
  ) => Promise<boolean>;
  handleDeleteUserClassroom: (
    userId: string,
    classroomsIds: string[]
  ) => Promise<boolean>;
}
