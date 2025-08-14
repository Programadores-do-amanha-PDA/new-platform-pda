import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import {
  getZoomMeetingById,
  getAllZoomMeetingsByClassroomId,
  updateZoomMeetingById,
  deleteZoomMeetingById,
  createZoomMeetingByClassroomId,
} from "@/app/actions/classrooms/zoom/meetings";
import { useZoomAPIStore } from "./api";
import { useZoomMeetingPastInstanceStore } from "./past-instances";
import { ZoomAccountT } from "@/types";
import {
  ZoomMeetingOccurrenceT,
  ZoomMeetingT,
  ZoomMeetingWithPastInstancies,
} from "@/types";
import { useUsersStore } from "../../users/users-store";

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
        let loadingToastId;
        try {
          if (
            !account.account_id ||
            !account.id ||
            !account.client_id ||
            !account.client_secret
          )
            throw new Error("Account data is missing");
          if (!meetingData.meeting_id || !meetingData.uuid)
            throw new Error("Meeting data is missing");

          const meetingResponse = await useZoomAPIStore
            .getState()
            .getMeetingByAPI(account, meetingData);
          if (!meetingResponse) throw new Error("no meeting response");

          const meetingEndTime = new Date(
            new Date(
              meetingData.start_time || meetingData.created_at || 0
            ).getTime() +
              (meetingData?.duration || 0) * 60000
          ).getTime();

          // Lógica para reuniões recorrentes
          if (
            meetingResponse &&
            ("past_instances" in meetingResponse ||
              meetingResponse.type === 8 ||
              meetingResponse.type === 3)
          ) {
            // Reunião recorrente - buscar todas as instâncias passadas
            const meetingWithPastInstances = meetingResponse as Omit<
              ZoomMeetingWithPastInstancies,
              "id" | "created_at"
            >;
            const { past_instances, ...restOfMeeting } =
              meetingWithPastInstances;

            console.log(past_instances, restOfMeeting);

            loadingToastId = toast.loading(
              "Criando a reunião, por favor aguarde..."
            );

            const newMeeting = await createZoomMeetingByClassroomId({
              ...meetingData,
              synchronized_at: new Date().toISOString(),
              ...restOfMeeting,
              classroom_id: account?.classroom_id,
            });
            if (!newMeeting) throw new Error("no meeting create response");

            // Criar instâncias passadas se existirem
            if (past_instances && past_instances.length > 0) {
              const pastInstancesData = past_instances.map((instance) => {
                const classroomParticipantsEmails = useUsersStore
                  .getState()
                  .users.filter((user) =>
                    user.profile?.classrooms
                      ?.map((c) => c.classroom_id)
                      .includes(account.classroom_id || "")
                  )
                  .map((user) => user.email)
                  .filter((email): email is string => email !== undefined);
                const hasClassroomEmails =
                  classroomParticipantsEmails?.length ?? 0 > 0;
                const instanceParticipants = instance.participants ?? [];

                const hasMatchingParticipants = hasClassroomEmails
                  ? instanceParticipants.some((p) =>
                      classroomParticipantsEmails?.includes(p.user_email)
                    )
                  : false;

                const hasParticipantsOnInstance = hasClassroomEmails
                  ? hasMatchingParticipants
                  : instance.is_visible_on_schedule;

                return {
                  classroom_id: account.classroom_id,
                  account_id: account.id,
                  meeting_id: newMeeting.id,
                  uuid: instance.uuid,
                  start_time: instance.start_time,
                  class_type: instance.class_type,
                  participants: instance.participants || [],
                  poll_results: instance.poll_results || [],
                  justifications: instance.justifications || [],
                  synchronized_at: new Date().toISOString(),
                  is_visible_on_schedule: hasParticipantsOnInstance,
                };
              });

              await useZoomMeetingPastInstanceStore
                .getState()
                .createMultiplePastInstances(pastInstancesData);
            }

            set({ meetings: [newMeeting, ...get().meetings] });
            toast.dismiss(loadingToastId);
            toast.success(`Reunião "${newMeeting.topic}" criada com sucesso!`);
            return newMeeting.id as string;
          } else {
            let meetingToCreate;
            // Reunião futura
            if (meetingEndTime > Date.now()) {
              meetingToCreate = {
                ...meetingResponse,
                participants: [],
                account_id: account.id,
              };
            }
            // Reunião passada
            else {
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
                ...meetingResponse,
                participants: participants || [],
                account_id: account.id,
              };

              if (pollResults && pollResults.length > 0) {
                (meetingToCreate as ZoomMeetingT).poll_results = pollResults;
              }
            }

            loadingToastId = toast.loading(
              "Criando a reunião, por favor aguarde..."
            );
            const newMeeting = await createZoomMeetingByClassroomId({
              ...meetingData,
              synchronized_at: new Date().toISOString(),
              ...meetingToCreate,
              classroom_id: account?.classroom_id,
            });
            if (!newMeeting) throw new Error("no meeting create response");

            set({ meetings: [newMeeting, ...get().meetings] });
            toast.dismiss(loadingToastId);
            toast.success(`Reunião "${newMeeting.topic}" criada com sucesso!`);
            return newMeeting.id as string;
          }
        } catch (error) {
          console.error(error);
          toast.error("Erro ao criar nova reunião!");
          return false;
        } finally {
          toast.dismiss(loadingToastId);
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
        let loadingToastId;
        try {
          if (
            !account.account_id ||
            !account.id ||
            !account.client_id ||
            !account.client_secret
          )
            throw new Error("Account data is missing");
          if (
            !meeting.id ||
            !meeting.meeting_id ||
            !meeting.uuid ||
            !meeting.start_time ||
            !meeting.duration
          )
            throw new Error("Meeting data is missing");

          loadingToastId = toast.loading("Atualizando dados da reunião...", {
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
            .getMeetingByAPI(account, meeting);

          if (!updatedMeetingData) throw new Error("no meeting response");

          // Check is meeting recurrence
          if (
            updatedMeetingData &&
            ("past_instances" in updatedMeetingData ||
              updatedMeetingData.type === 8 ||
              updatedMeetingData.type === 3)
          ) {
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
                  const pastInstancesData = newPastInstances.map((instance) => {
                    const classroomParticipantsEmails = useUsersStore
                      .getState()
                      .users.filter((user) =>
                        user.profile?.classrooms
                          ?.map((c) => c.classroom_id)
                          .includes(account.classroom_id || "")
                      )
                      .map((user) => user.email)
                      .filter((email): email is string => email !== undefined);
                    const hasClassroomEmails =
                      classroomParticipantsEmails?.length ?? 0 > 0;
                    const instanceParticipants = instance.participants ?? [];

                    const hasMatchingParticipants = hasClassroomEmails
                      ? instanceParticipants.some((p) =>
                          classroomParticipantsEmails?.includes(p.user_email)
                        )
                      : false;

                    const hasParticipantsOnInstance = hasClassroomEmails
                      ? hasMatchingParticipants
                      : instance.is_visible_on_schedule;

                    return {
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
                      is_visible_on_schedule: hasParticipantsOnInstance,
                    };
                  });

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
        } finally {
          toast.dismiss(loadingToastId);
        }
      },

      deleteMeeting: async (meetingId) => {
        let loadingToastId;
        try {
          if (!meetingId) throw new Error("meeting id is required to delete");

          loadingToastId = toast.loading("Excluindo os dados da conta...");
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
          toast.dismiss(loadingToastId);
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ZoomMeetingStore" }
  )
);
