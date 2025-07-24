import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getZoomMeetingById,
  getAllZoomMeetingsByClassroomId,
  updateZoomMeetingById,
  deleteZoomMeetingById,
  createZoomMeetingByClassroomId,
} from "@/app/actions/classrooms/zoom/meetings";
import { ZoomAccountT } from "@/types/zoom/accounts";
import { ZoomMeetingOccurrenceT, ZoomMeetingT } from "@/types/zoom/meetings";
import { toast } from "sonner";
import { useZoomAPIStore } from "./api";

interface ZoomMeetingState {
  meetings: ZoomMeetingT[];
  loading: boolean;
}

interface ZoomMeetingActions {
  setMeetings: (meetings: ZoomMeetingT[]) => void;
  getAllMeetings: (classroomId: string) => Promise<boolean>;
  getMeetingById: (meetingId: string) => Promise<ZoomMeetingT | boolean>;
  createMeeting: (
    account: Partial<ZoomAccountT>,
    meetingData: Partial<ZoomMeetingT>
  ) => Promise<string | false>;
  updateMeeting: (
    meetingId: string,
    updates: Partial<ZoomMeetingT>
  ) => Promise<boolean>;
  updateMeetingOccurrence: (
    meetingId: string,
    occurrenceId: string,
    updates: Partial<ZoomMeetingOccurrenceT>
  ) => Promise<boolean>;
  refreshAndUpdateMeeting: (
    meetingId: string,
    account: Partial<ZoomAccountT>
  ) => Promise<boolean>;
  deleteMeeting: (meetingId: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: ZoomMeetingState = {
  meetings: [],
  loading: false,
};

export const useZoomMeetingStore = create<
  ZoomMeetingState & ZoomMeetingActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setMeetings: (meetings) => set({ meetings }),

      getAllMeetings: async (classroomId) => {
        try {
          set({ loading: true });
          const meetingsResponse = await getAllZoomMeetingsByClassroomId(
            classroomId
          );
          if (!meetingsResponse) throw "no meetings response";
          set({ meetings: meetingsResponse });
          return true;
        } catch (error) {
          console.error(error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getMeetingById: async (meetingId) => {
        try {
          set({ loading: true });
          const meetingResponse = await getZoomMeetingById(meetingId);
          if (!meetingResponse) throw "no meeting response";
          return meetingResponse;
        } catch (error) {
          console.error(error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createMeeting: async (account, meetingData) => {
        try {
          if (
            !meetingData.id ||
            !account.account_id ||
            !account.client_id ||
            !account.client_secret
          ) {
            toast.error("Dados obrigatórios da reunião estão faltando!");
            throw new Error("missing required meeting data");
          }

          const meeting = await useZoomAPIStore
            .getState()
            .getMeetingByAPI(account, meetingData.id);
          if (!meeting) throw new Error("no meeting response");

          const newMeeting = await createZoomMeetingByClassroomId({
            ...meetingData,
            account_id: account.id,
            classroom_id: account.classroom_id,
            synchronized_at: new Date().toString(),
            ...meeting,
          });

          if (!newMeeting) throw new Error("no meeting create response");

          set({ meetings: [newMeeting, ...get().meetings] });
          toast.success(`Reunião "${newMeeting.topic}" criada com sucesso!`);
          return newMeeting.id as string;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao criar nova reunião!");
          return false;
        }
      },

      updateMeeting: async (meetingId, updates) => {
        try {
          if (!meetingId || !updates) {
            throw new Error("id and updates fields are required");
          }
          const updatedMeeting = await updateZoomMeetingById(
            meetingId,
            updates
          );
          if (!updatedMeeting) throw new Error("no update meeting response");

          set({
            meetings: get().meetings.map((meeting) =>
              meeting.id === meetingId ? updatedMeeting : meeting
            ),
          });
          toast.success("Reunião atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao atualizar a reunião!");
          return false;
        }
      },

      updateMeetingOccurrence: async (meetingId, occurrenceId, updates) => {
        try {
          if (!meetingId || !occurrenceId || !updates) {
            throw new Error("id and updates fields are required");
          }
          const currentMeeting = get().meetings.find(
            (meeting) => meeting.id === meetingId
          );
          const updatedOccurrences = currentMeeting?.occurrences?.map(
            (occurrence) =>
              occurrence.occurrence_id === occurrenceId
                ? { ...occurrence, ...updates }
                : occurrence
          );
          const updatedMeeting: ZoomMeetingT | false =
            await updateZoomMeetingById(meetingId, {
              occurrences: updatedOccurrences,
            });
          if (!updatedMeeting) throw new Error("no update meeting response");

          set({
            meetings: get().meetings.map((meeting) =>
              meeting.id === meetingId ? updatedMeeting : meeting
            ),
          });
          toast.success("Reunião atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao atualizar a reunião!");
          return false;
        }
      },

      refreshAndUpdateMeeting: async (meetingId, account) => {
        try {
          if (
            !meetingId ||
            !account.account_id ||
            !account.client_id ||
            !account.client_secret
          ) {
            throw new Error("id and updates fields are required");
          }
          toast.info("Atualizando dados da reunião...", {
            duration: 50000,
            closeButton: true,
          });

          const currentMeeting = get().meetings.find(
            (meeting) => meeting.id === meetingId
          );
          const updatedMeeting = await useZoomAPIStore
            .getState()
            .getMeetingByAPI(account, meetingId);
          if (!updatedMeeting) throw new Error("no meeting response");

          const newMeeting = await updateZoomMeetingById(meetingId, {
            ...currentMeeting,
            ...updatedMeeting,
            occurrences: updatedMeeting?.occurrences?.map((occurrence) => {
              const currentOccurrence = currentMeeting?.occurrences?.find(
                (currentOccurrence) =>
                  currentOccurrence.occurrence_id === occurrence.occurrence_id
              );

              return currentOccurrence
                ? { ...occurrence, ...currentOccurrence }
                : occurrence;
            }),
            synchronized_at: new Date().toISOString(),
          });

          if (!newMeeting) throw new Error("no meeting create response");

          set({
            meetings: get().meetings.map((meeting) =>
              meeting.id === currentMeeting?.id ? newMeeting : meeting
            ),
          });
          toast.success("Dados da reunião atualizados com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao atualizar dados da reunião!");
          return false;
        }
      },

      deleteMeeting: async (meetingId) => {
        try {
          if (!meetingId) throw new Error("meeting id is required to delete");
          set({ loading: true });
          const response = await deleteZoomMeetingById(meetingId);
          if (!response) throw new Error("no delete meeting response");

          set({
            meetings: get().meetings.filter(
              (meeting) => meeting.id !== meetingId
            ),
          });
          toast.success("Reunião deletada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao deletar reunião. Tente novamente mais tarde!");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ZoomMeetingStore" }
  )
);
