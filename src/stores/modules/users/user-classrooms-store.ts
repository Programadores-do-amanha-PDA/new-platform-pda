import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { AuthUserWithProfileT, ProfileT } from "@/types/auth";
import { UserClassroomT } from "@/types/auth/user-classroom";
import {
  insertUserClassroom,
  deleteUserClassroom,
  updateUserClassroomMode,
} from "@/app/actions/user-classroom";

interface UserClassroomsState {
  users: Partial<AuthUserWithProfileT>[];
  loading: boolean;
}

interface UserClassroomsActions {
  setUsers: (users: Partial<AuthUserWithProfileT>[]) => void;
  createUserClassrooms: (
    usersClassrooms: Omit<UserClassroomT, "short_id">[]
  ) => Promise<boolean>;
  deleteUserClassroom: (
    userId: string,
    classroomsIds: string[]
  ) => Promise<boolean>;
  updateUserMode: (
    userId: string,
    classroomId: string,
    mode: string
  ) => Promise<boolean>;
  reset: () => void;
}

const initialState: UserClassroomsState = {
  users: [],
  loading: false,
};

export const useUserClassroomsStore = create<
  UserClassroomsState & UserClassroomsActions
>()(
  devtools(
    (set) => ({
      ...initialState,

      setUsers: (users) => set({ users }),

      createUserClassrooms: async (usersClassrooms: UserClassroomT[]) => {
        try {
          if (!usersClassrooms.length) {
            toast.error("Nenhum usuário selecionado para vincular à turma!");
            throw new Error("empty users classroom array");
          }
          const response = await insertUserClassroom(usersClassrooms);
          if (!response) throw new Error("No insert user classroom response");

          set((state) => ({
            users: state.users.map((user) => {
              if (!user) return user;

              const newClassrooms = response
                .filter((uc) => uc.user_id === user.id)
                .map((uc) => ({
                  classroom_id: uc.classroom_id,
                  user_id: uc.user_id,
                  short_id: uc.short_id,
                  mode: uc.mode || "",
                }));

              return {
                ...user,
                profile: {
                  ...(user.profile || ({} as ProfileT)),
                  classrooms: [
                    ...(user.profile?.classrooms || []),
                    ...newClassrooms,
                  ],
                },
              };
            }),
          }));

          toast.success(`${response.length} vínculo(s) criado(s) com sucesso!`);
          return true;
        } catch (error) {
          toast.error("Erro ao vincular usuários à turma!");
          console.error(error);
          return false;
        }
      },

      deleteUserClassroom: async (userId: string, classroomsIds: string[]) => {
        try {
          if (!userId || !classroomsIds.length) {
            throw new Error("user id and classroom id are required");
          }
          const response = await deleteUserClassroom(userId, classroomsIds);
          if (!response) throw new Error("no delete user classroom response");

          set((state) => ({
            users: state.users.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    profile: {
                      ...(user.profile || ({} as ProfileT)),
                      classrooms: (user.profile?.classrooms || []).filter(
                        (uc) => !classroomsIds.includes(uc.classroom_id)
                      ),
                    },
                  }
                : user
            ),
          }));

          toast.success("Vínculo usuário-turma removido com sucesso!");
          return true;
        } catch (error) {
          toast.error("Erro ao remover vínculo usuário-turma!");
          console.error(error);
          return false;
        }
      },

      updateUserMode: async (
        userId: string,
        classroomId: string,
        mode: string
      ) => {
        try {
          const response = await updateUserClassroomMode(
            userId,
            classroomId,
            mode
          );
          if (!response)
            throw new Error("No update user classroom mode response");

          set((state) => ({
            users: state.users.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    profile: {
                      ...(user.profile || ({} as ProfileT)),
                      classrooms: (user.profile?.classrooms || []).map((uc) =>
                        uc.classroom_id === classroomId ? { ...uc, mode } : uc
                      ),
                    },
                  }
                : user
            ),
          }));

          toast.success("Modo do usuário atualizado com sucesso!");
          return true;
        } catch (error) {
          toast.error("Erro ao atualizar modo do usuário!");
          console.error(error);
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ClassroomsStore" }
  )
);
