import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getAllActivitiesByClassroomId,
  getActivityById,
  createActivity,
  createMultipleActivities,
  updateActivityById,
  deleteActivityById,
} from "@/app/actions/classrooms/activities/activity";
import { ClassroomActivityT } from "@/types/classroom-activities/activities";
import { toast } from "sonner";

interface ClassroomActivityState {
  activities: ClassroomActivityT[];
  loading: boolean;
}

interface ClassroomActivityActions {
  setActivities: (activities: ClassroomActivityT[]) => void;
  getAllActivitiesByClassroom: (classroomId: string) => Promise<boolean>;
  getActivityById: (
    activityId: string
  ) => Promise<ClassroomActivityT | boolean>;
  createActivity: (
    activityData: Partial<Omit<ClassroomActivityT, "id" | "created_at">>
  ) => Promise<boolean>;
  createMultipleActivities: (
    activitiesData: Partial<Omit<ClassroomActivityT, "id" | "created_at">>[]
  ) => Promise<boolean>;
  updateActivityById: (
    activityId: string,
    updates: Partial<Omit<ClassroomActivityT, "id" | "created_at">>
  ) => Promise<boolean>;
  deleteActivity: (activityId: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: ClassroomActivityState = {
  activities: [],
  loading: false,
};

export const useClassroomActivityStore = create<
  ClassroomActivityState & ClassroomActivityActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setActivities: (activities) => set({ activities }),

      getAllActivitiesByClassroom: async (classroomId) => {
        try {
          set({ loading: true });
          const activitiesResponse = await getAllActivitiesByClassroomId(
            classroomId
          );
          if (!activitiesResponse) throw "no activities response";
          set({ activities: activitiesResponse });
          return true;
        } catch (error) {
          console.error("Error fetching activities by classroom:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getActivityById: async (activityId) => {
        try {
          set({ loading: true });
          const activityResponse = await getActivityById(activityId);
          if (!activityResponse) throw "no activity response";
          return activityResponse;
        } catch (error) {
          console.error("Error fetching activity by ID:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createActivity: async (activityData) => {
        try {
          if (!activityData.classroom_id) {
            toast.error("ID da turma é obrigatório!");
            throw new Error("Missing required field: classroom_id");
          }

          const newActivity = await createActivity(activityData);
          if (!newActivity) throw new Error("no activity create response");

          set({ activities: [newActivity, ...get().activities] });
          toast.success("Atividade criada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error creating activity:", error);
          toast.error("Erro ao criar nova atividade!");
          return false;
        }
      },

      createMultipleActivities: async (activitiesData) => {
        let loadingToastId;
        try {
          if (!activitiesData || activitiesData.length === 0) {
            toast.error("Nenhuma atividade foi fornecida!");
            throw new Error("No activities data provided");
          }

          // Validate required fields
          for (const activityData of activitiesData) {
            if (!activityData.classroom_id) {
              toast.error(
                "ID da turma está faltando em uma ou mais atividades!"
              );
              throw new Error(
                "Missing required field: classroom_id in one or more activities"
              );
            }
          }

          loadingToastId = toast.loading(
            `Criando ${activitiesData.length} atividades...`
          );

          const newActivities = await createMultipleActivities(activitiesData);
          if (!newActivities)
            throw new Error("no multiple activities create response");

          set({
            activities: [...newActivities, ...get().activities],
          });

          toast.dismiss(loadingToastId);
          toast.success(
            `${newActivities.length} atividades criadas com sucesso!`
          );
          return true;
        } catch (error) {
          console.error("Error creating multiple activities:", error);
          toast.error("Erro ao criar múltiplas atividades!");
          return false;
        } finally {
          set({ loading: false });
          toast.dismiss(loadingToastId);
        }
      },

      updateActivityById: async (activityId, updates) => {
        try {
          if (!activityId || !updates) {
            throw new Error("id and updates fields are required");
          }

          const loadingToastId = toast.loading("Atualizando atividade...");
          const updatedActivity = await updateActivityById(activityId, updates);
          if (!updatedActivity) throw new Error("no update activity response");

          set({
            activities: get().activities.map((activity) =>
              activity.id === activityId ? updatedActivity : activity
            ),
          });

          toast.dismiss(loadingToastId);
          toast.success("Atividade atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating activity:", error);
          toast.error("Erro ao atualizar a atividade!");
          return false;
        }
      },

      deleteActivity: async (activityId) => {
        try {
          if (!activityId) throw new Error("activity id is required to delete");

          set({ loading: true });
          const response = await deleteActivityById(activityId);
          if (!response) throw new Error("no delete activity response");

          set({
            activities: get().activities.filter(
              (activity) => activity.id !== activityId
            ),
          });
          toast.success("Atividade deletada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error deleting activity:", error);
          toast.error("Erro ao deletar atividade. Tente novamente mais tarde!");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ClassroomActivityStore" }
  )
);
