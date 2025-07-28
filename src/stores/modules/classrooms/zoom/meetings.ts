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
import {
  ZoomMeetingOccurrenceT,
  ZoomMeetingT,
  ZoomMeetingWithPastInstancies,
} from "@/types/zoom/meetings";
import { toast } from "sonner";
import { useZoomAPIStore } from "./api";
import { useZoomMeetingPastInstanceStore } from "./past-instances";

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
    meeting: Partial<ZoomMeetingT>,
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
            !meetingData.meeting_id ||
            !account.account_id ||
            !account.client_id ||
            !account.client_secret ||
            !account.classroom_id
          ) {
            toast.error("Dados obrigatórios da reunião estão faltando!");
            throw new Error("missing required meeting data");
          }

          const meeting = await useZoomAPIStore
            .getState()
            .getMeetingByAPI(account, meetingData.meeting_id);
          if (!meeting) throw new Error("no meeting response");

          // Lógica para reuniões não recorrentes
          if (meeting.type !== 8) {
            const meetingStartTime = new Date(
              meeting.start_time || 0
            ).getTime();
            const currentTime = new Date().getTime();

            let meetingToCreate;
            if (meetingStartTime >= currentTime) {
              // Reunião futura - sem participantes nem polls
              meetingToCreate = {
                ...meeting,
                participants: [],
                account_id: account.id,
              };
            } else {
              // Reunião passada - buscar participantes e polls
              const participants = await useZoomAPIStore
                .getState()
                .getAllParticipantsByMeetingIdFromAPI(
                  account,
                  meetingData.meeting_id
                );
              const pollResults = await useZoomAPIStore
                .getState()
                .getAllPollResultsByMeetingIdFromAPI(
                  account,
                  meetingData.meeting_id
                );

              meetingToCreate = {
                ...meeting,
                participants: participants || [],
                account_id: account.id,
              };

              // Adicionar poll_results apenas se existirem e não estiverem vazios
              if (pollResults && pollResults.length > 0) {
                (meetingToCreate as ZoomMeetingT).poll_results = pollResults;
              }
            }

            const newMeeting = await createZoomMeetingByClassroomId({
              ...meetingData,
              synchronized_at: new Date().toISOString(),
              ...meetingToCreate,
              classroom_id: account?.classroom_id,
            });

            if (!newMeeting) throw new Error("no meeting create response");

            set({ meetings: [newMeeting, ...get().meetings] });
            toast.success(`Reunião "${newMeeting.topic}" criada com sucesso!`);
            return newMeeting.id as string;
          } else if (meeting.type === 8) {
            // Reunião recorrente - buscar todas as instâncias passadas
            const meetingWithPastInstances = meeting as Omit<
              ZoomMeetingWithPastInstancies,
              "id" | "created_at"
            >;
            const { past_instances, ...restOfMeeting } =
              meetingWithPastInstances;

            const newMeeting = await createZoomMeetingByClassroomId({
              ...meetingData,
              synchronized_at: new Date().toISOString(),
              ...restOfMeeting,
              classroom_id: account?.classroom_id,
            });

            // Criar instâncias passadas se existirem
            if (newMeeting && past_instances && past_instances.length > 0) {
              const pastInstancesData = past_instances.map((instance) => ({
                classroom_id: account.classroom_id!,
                account_id: account.id!,
                meeting_id: newMeeting.id,
                uuid: instance.uuid,
                start_time: instance.start_time,
                class_type: instance.class_type,
                participants: instance.participants || [],
                poll_results: instance.poll_results || [],
                justifications: instance.justifications || [],
                synchronized_at: new Date().toISOString(),
                is_visible_on_schedule: instance.is_visible_on_schedule,
              }));

              await useZoomMeetingPastInstanceStore
                .getState()
                .createMultiplePastInstances(pastInstancesData);
            }

            if (!newMeeting) throw new Error("no meeting create response");

            set({ meetings: [newMeeting, ...get().meetings] });
            toast.success(`Reunião "${newMeeting.topic}" criada com sucesso!`);
            return newMeeting.id as string;
          }
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

      refreshAndUpdateMeeting: async (meeting, account) => {
        try {
          if (
            !meeting.meeting_id ||
            !meeting.id ||
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
            (m) => m.id === meeting.id
          );

          if (!currentMeeting) {
            throw new Error("Meeting not found in current meetings");
          }

          // Buscar dados atualizados da reunião da API do Zoom
          const updatedMeetingData = await useZoomAPIStore
            .getState()
            .getMeetingByAPI(account, meeting.meeting_id);

          if (!updatedMeetingData) throw new Error("no meeting response");

          // Verificar se é reunião recorrente (tipo 8)
          if (updatedMeetingData.type === 8) {
            // Para reuniões recorrentes, atualizar a reunião principal
            const meetingWithPastInstances = updatedMeetingData as Omit<
              ZoomMeetingWithPastInstancies,
              "id" | "created_at"
            >;
            const { past_instances, ...restOfMeeting } =
              meetingWithPastInstances;

            const updatedMeeting = await updateZoomMeetingById(meeting.id, {
              ...currentMeeting,
              ...restOfMeeting,
              occurrences: updatedMeetingData?.occurrences?.map(
                (occurrence) => {
                  const currentOccurrence = currentMeeting?.occurrences?.find(
                    (currentOccurrence) =>
                      currentOccurrence.occurrence_id ===
                      occurrence.occurrence_id
                  );
                  return currentOccurrence
                    ? { ...occurrence, ...currentOccurrence }
                    : occurrence;
                }
              ),
              synchronized_at: new Date().toISOString(),
            });

            if (!updatedMeeting) throw new Error("no meeting update response");

            // Verificar se há novas instâncias passadas para salvar
            if ("past_instances" in updatedMeetingData && past_instances) {
              const existingPastInstances =
                await useZoomMeetingPastInstanceStore
                  .getState()
                  .getAllPastInstancesByMeeting(meeting.id);

              if (existingPastInstances) {
                const currentPastInstances =
                  useZoomMeetingPastInstanceStore.getState().pastInstances;
                const existingUuids = new Set(
                  currentPastInstances.map((instance) => instance.uuid)
                );

                // Filtrar apenas as novas instâncias que não existem no Supabase
                const newPastInstances = past_instances.filter(
                  (instance) => !existingUuids.has(instance.uuid)
                );

                if (newPastInstances.length > 0) {
                  const pastInstancesData = newPastInstances.map(
                    (instance) => ({
                      classroom_id: account.classroom_id!,
                      account_id: account.id!,
                      meeting_id: meeting.id,
                      uuid: instance.uuid,
                      start_time: instance.start_time,
                      class_type: instance.class_type,
                      participants: instance.participants || [],
                      poll_results: instance.poll_results || [],
                      justifications: instance.justifications || [],
                      synchronized_at: new Date().toISOString(),
                      is_visible_on_schedule: instance.is_visible_on_schedule,
                    })
                  );

                  await useZoomMeetingPastInstanceStore
                    .getState()
                    .createMultiplePastInstances(pastInstancesData);

                  toast.success(
                    `${newPastInstances.length} novas instâncias passadas foram salvas!`
                  );
                }
              }
            }

            set({
              meetings: get().meetings.map((m) =>
                m.id === currentMeeting.id ? updatedMeeting : m
              ),
            });
          } else {
            // Para reuniões não recorrentes, atualizar participantes e polls se a reunião já aconteceu
            const meetingStartTime = new Date(
              updatedMeetingData.start_time || 0
            ).getTime();
            const currentTime = new Date().getTime();

            let finalMeetingData = { ...updatedMeetingData };

            if (meetingStartTime < currentTime) {
              // Reunião já aconteceu - buscar participantes e polls atualizados
              const participants = await useZoomAPIStore
                .getState()
                .getAllParticipantsByMeetingIdFromAPI(
                  account,
                  meeting.meeting_id
                );

              const pollResults = await useZoomAPIStore
                .getState()
                .getAllPollResultsByMeetingIdFromAPI(
                  account,
                  meeting.meeting_id
                );

              finalMeetingData = {
                ...finalMeetingData,
                participants: participants || [],
                poll_results: pollResults || [],
              };
            }

            const updatedMeeting = await updateZoomMeetingById(meeting.id, {
              ...currentMeeting,
              ...finalMeetingData,
              occurrences: finalMeetingData?.occurrences?.map((occurrence) => {
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

            if (!updatedMeeting) throw new Error("no meeting update response");

            set({
              meetings: get().meetings.map((m) =>
                m.id === currentMeeting.id ? updatedMeeting : m
              ),
            });
          }

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
