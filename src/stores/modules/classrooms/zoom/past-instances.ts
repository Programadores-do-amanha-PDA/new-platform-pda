import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getAllPastInstancesByClassroomId,
  getAllPastInstancesByMeetingId,
  getPastInstanceById,
  getPastInstanceByUuid,
  createPastInstance,
  updatePastInstanceById,
  updatePastInstanceByUuid,
  deletePastInstanceById,
} from "@/app/actions/classrooms/zoom/past-instances";
import { ZoomMeetingPastInstanceT } from "@/types/zoom/past-instances";
import { toast } from "sonner";

interface ZoomMeetingPastInstanceState {
  pastInstances: ZoomMeetingPastInstanceT[];
  loading: boolean;
}

interface ZoomMeetingPastInstanceActions {
  setPastInstances: (pastInstances: ZoomMeetingPastInstanceT[]) => void;
  getAllPastInstancesByClassroom: (classroomId: string) => Promise<boolean>;
  getAllPastInstancesByMeeting: (meetingId: string) => Promise<boolean>;
  getPastInstanceById: (
    pastInstanceId: string
  ) => Promise<ZoomMeetingPastInstanceT | boolean>;
  getPastInstanceByUuid: (
    uuid: string
  ) => Promise<ZoomMeetingPastInstanceT | boolean>;
  createPastInstance: (
    pastInstanceData: Partial<Omit<ZoomMeetingPastInstanceT, "id | ">>
  ) => Promise<boolean>;
  updatePastInstanceById: (
    pastInstanceId: string,
    updates: Partial<Omit<ZoomMeetingPastInstanceT, "id | ">>
  ) => Promise<boolean>;
  updatePastInstanceByUuid: (
    uuid: string,
    updates: Partial<Omit<ZoomMeetingPastInstanceT, "id | ">>
  ) => Promise<boolean>;
  deletePastInstance: (pastInstanceId: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: ZoomMeetingPastInstanceState = {
  pastInstances: [],
  loading: false,
};

export const useZoomMeetingPastInstanceStore = create<
  ZoomMeetingPastInstanceState & ZoomMeetingPastInstanceActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setPastInstances: (pastInstances) => set({ pastInstances }),

      getAllPastInstancesByClassroom: async (classroomId) => {
        try {
          set({ loading: true });
          const pastInstancesResponse = await getAllPastInstancesByClassroomId(
            classroomId
          );
          if (!pastInstancesResponse) throw "no past instances response";
          set({ pastInstances: pastInstancesResponse });
          return true;
        } catch (error) {
          console.error("Error fetching past instances by classroom:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getAllPastInstancesByMeeting: async (meetingId) => {
        try {
          set({ loading: true });
          const pastInstancesResponse = await getAllPastInstancesByMeetingId(
            meetingId
          );
          if (!pastInstancesResponse) throw "no past instances response";
          set({ pastInstances: pastInstancesResponse });
          return true;
        } catch (error) {
          console.error("Error fetching past instances by meeting:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getPastInstanceById: async (pastInstanceId) => {
        try {
          set({ loading: true });
          const pastInstanceResponse = await getPastInstanceById(
            pastInstanceId
          );
          if (!pastInstanceResponse) throw "no past instance response";
          return pastInstanceResponse;
        } catch (error) {
          console.error("Error fetching past instance by ID:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getPastInstanceByUuid: async (uuid) => {
        try {
          set({ loading: true });
          const pastInstanceResponse = await getPastInstanceByUuid(uuid);
          if (!pastInstanceResponse) throw "no past instance response";
          return pastInstanceResponse;
        } catch (error) {
          console.error("Error fetching past instance by UUID:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createPastInstance: async (pastInstanceData) => {
        try {
          if (
            !pastInstanceData.classroom_id ||
            !pastInstanceData.meeting_id ||
            !pastInstanceData.uuid
          ) {
            toast.error(
              "Dados obrigatórios da instância passada estão faltando!"
            );
            throw new Error(
              "Missing required fields: classroom_id, meeting_id, or uuid"
            );
          }

          const newPastInstance = await createPastInstance(pastInstanceData);
          if (!newPastInstance)
            throw new Error("no past instance create response");

          set({ pastInstances: [newPastInstance, ...get().pastInstances] });
          toast.success("Instância passada criada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error creating past instance:", error);
          toast.error("Erro ao criar nova instância passada!");
          return false;
        }
      },

      updatePastInstanceById: async (pastInstanceId, updates) => {
        try {
          if (!pastInstanceId || !updates) {
            throw new Error("id and updates fields are required");
          }

          const loadingToastId = toast.loading(
            "Atualizando instância passada..."
          );
          const updatedPastInstance = await updatePastInstanceById(
            pastInstanceId,
            updates
          );
          if (!updatedPastInstance)
            throw new Error("no update past instance response");

          set({
            pastInstances: get().pastInstances.map((pastInstance) =>
              pastInstance.id === pastInstanceId
                ? updatedPastInstance
                : pastInstance
            ),
          });

          toast.dismiss(loadingToastId);
          toast.success("Instância passada atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating past instance:", error);
          toast.error("Erro ao atualizar a instância passada!");
          return false;
        }
      },

      updatePastInstanceByUuid: async (uuid, updates) => {
        try {
          if (!uuid || !updates) {
            throw new Error("uuid and updates fields are required");
          }

          const loadingToastId = toast.loading(
            "Atualizando instância passada..."
          );
          const updatedPastInstance = await updatePastInstanceByUuid(
            uuid,
            updates
          );
          if (!updatedPastInstance)
            throw new Error("no update past instance response");

          set({
            pastInstances: get().pastInstances.map((pastInstance) =>
              pastInstance.uuid === uuid ? updatedPastInstance : pastInstance
            ),
          });

          toast.dismiss(loadingToastId);
          toast.success("Instância passada atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating past instance by UUID:", error);
          toast.error("Erro ao atualizar a instância passada!");
          return false;
        }
      },

      deletePastInstance: async (pastInstanceId) => {
        try {
          if (!pastInstanceId)
            throw new Error("past instance id is required to delete");

          set({ loading: true });
          const response = await deletePastInstanceById(pastInstanceId);
          if (!response) throw new Error("no delete past instance response");

          set({
            pastInstances: get().pastInstances.filter(
              (pastInstance) => pastInstance.id !== pastInstanceId
            ),
          });
          toast.success("Instância passada deletada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error deleting past instance:", error);
          toast.error(
            "Erro ao deletar instância passada. Tente novamente mais tarde!"
          );
          return false;
        } finally {
          set({ loading: false });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ZoomMeetingPastInstanceStore" }
  )
);
