import {
  createClassroom,
  deleteClassroom,
  getAllClassrooms,
  updateClassroom,
} from "@/app/actions";
import { ClassroomT } from "@/types/classrooms";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { safeIconName } from "@/utils/lucide-safe";

interface ClassroomState {
  classrooms: ClassroomT[];
  loading: boolean;
}

interface ClassroomActions {
  setClassrooms: (classrooms: ClassroomT[]) => void;
  getAllClassrooms: () => Promise<boolean>;
  createClassroom: (
    classroomData: Partial<ClassroomT>
  ) => Promise<boolean | string>;
  updateClassroom: (
    classroomId: string,
    updates: Partial<ClassroomT>
  ) => Promise<boolean>;
  deleteClassroom: (classroomId: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: ClassroomState = {
  classrooms: [],
  loading: false,
};

export const useClassroomStore = create<ClassroomState & ClassroomActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setClassrooms: (classrooms) => set({ classrooms }),

      getAllClassrooms: async () => {
        try {
          set({ loading: true });
          const classroomsResponse = await getAllClassrooms();
          if (!classroomsResponse) throw "no classrooms response";
          
          // Garantir que todos os classrooms tenham um ícone válido
          const classroomsWithValidIcons = classroomsResponse.map(classroom => ({
            ...classroom,
            icon: safeIconName(classroom.icon)
          }));
          
          set({ classrooms: classroomsWithValidIcons});
          return true;
        } catch (error) {
          console.error(error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createClassroom: async (classroomData) => {
        try {
          const { classrooms } = get();

          if (
            !classroomData.name ||
            classroomData.name.trim().length === 0 ||
            classrooms.map((t) => t.name).includes(classroomData.name)
          ) {
            toast.error("Nome da turma é inválido ou já existe!");
            throw new Error("invalid classroom name");
          }

          if (!classroomData.period) {
            toast.error("Período da turma é inválido!");
            throw new Error("invalid classroom period");
          }

          const newClassroom = await createClassroom(classroomData);
          if (!newClassroom) throw new Error("no classroom create response");

          // Garantir que o novo classroom tenha um ícone válido
          const classroomWithValidIcon = {
            ...newClassroom,
            icon: safeIconName(newClassroom.icon)
          };

          set({ classrooms: [...classrooms, classroomWithValidIcon] });
          toast.success(`Turma ${newClassroom.name} criada com sucesso!`);
          return newClassroom.id;
        } catch (error) {
          toast.error("Erro ao criar nova turma!");
          console.error(error);
          return false;
        }
      },

      updateClassroom: async (classroomId, updates) => {
        try {
          const { classrooms } = get();

          if (!classroomId || !updates) {
            throw new Error("id and updates fields are required");
          }

          const classroomUpdated = await updateClassroom(classroomId, updates);
          if (!classroomUpdated)
            throw new Error("no update classroom response");

          // Garantir que o classroom atualizado tenha um ícone válido
          const classroomWithValidIcon = {
            ...classroomUpdated,
            icon: safeIconName(classroomUpdated.icon)
          };

          set({
            classrooms: classrooms.map((classroom) =>
              classroom.id === classroomId ? classroomWithValidIcon : classroom
            ),
          });
          toast.success("Turma atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao atualizar a turma!");
          return false;
        }
      },

      deleteClassroom: async (classroomId) => {
        try {
          if (!classroomId)
            throw new Error("classroom id is required to delete");

          const response = await deleteClassroom(classroomId);
          if (!response) throw new Error("no delete classroom response");

          set({
            classrooms: get().classrooms.filter(
              (classroom) => classroom.id !== classroomId
            ),
          });
          toast.success("Turma deletada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao deletar turma. Tente novamente mais tarde!");
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ClassroomStore" }
  )
);
