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
import {
  ZoomAccountT,
  ZoomMeetingOccurrenceT,
  ZoomMeetingT,
  ZoomMeetingWithPastInstancies,
  ZoomMeetingPastInstanceT,
  ZoomMeetingParticipantT,
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
  handleRecurrentMeetingUpdate: (
    meeting: Partial<ZoomMeetingT>,
    account: Partial<ZoomAccountT>,
    currentMeeting: ZoomMeetingT,
    updatedMeetingData: Omit<ZoomMeetingWithPastInstancies, "id" | "created_at">
  ) => Promise<void>;
  handleNonRecurrentMeetingUpdate: (
    meeting: Partial<ZoomMeetingT>,
    account: Partial<ZoomAccountT>,
    currentMeeting: ZoomMeetingT,
    updatedMeetingData: Partial<ZoomMeetingT>
  ) => Promise<void>;
  processNewPastInstances: (
    meetingId: string,
    account: Partial<ZoomAccountT>,
    pastInstances: Partial<ZoomMeetingPastInstanceT>[]
  ) => Promise<void>;
  updateExistingPastInstances: (
    meetingId: string,
    account: Partial<ZoomAccountT>,
    pastInstances: Partial<ZoomMeetingPastInstanceT>[]
  ) => Promise<void>;
  fetchAllPastInstancesData: (
    account: Partial<ZoomAccountT>,
    pastInstances: Partial<ZoomMeetingPastInstanceT>[]
  ) => Promise<Partial<ZoomMeetingPastInstanceT>[]>;
  fetchNewPastInstancesData: (
    account: Partial<ZoomAccountT>,
    pastInstances: Partial<ZoomMeetingPastInstanceT>[],
    existingUuids: Set<string>
  ) => Promise<Partial<ZoomMeetingPastInstanceT>[]>;
  refreshAllPastInstancesForMeeting: (
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
          ) {
            throw new Error("Account data is missing");
          }
          if (!meetingData.meeting_id || !meetingData.uuid) {
            throw new Error("Meeting data is missing");
          }

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
                  classroomParticipantsEmails?.length ?? 0 > 1;
                const instanceParticipants = instance.participants ?? [];

                const hasMatchingParticipants =
                  hasClassroomEmails && instanceParticipants.length > 1
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

          // Check if meeting is recurrent
          const isRecurrentMeeting =
            updatedMeetingData &&
            ("past_instances" in updatedMeetingData ||
              updatedMeetingData.type === 8 ||
              updatedMeetingData.type === 3);

          if (isRecurrentMeeting) {
            await get().handleRecurrentMeetingUpdate(
              meeting,
              account,
              currentMeeting,
              updatedMeetingData as Omit<
                ZoomMeetingWithPastInstancies,
                "id" | "created_at"
              >
            );
          } else {
            await get().handleNonRecurrentMeetingUpdate(
              meeting,
              account,
              currentMeeting,
              updatedMeetingData
            );
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

      handleRecurrentMeetingUpdate: async (
        meeting: Partial<ZoomMeetingT>,
        account: Partial<ZoomAccountT>,
        currentMeeting: ZoomMeetingT,
        updatedMeetingData: Omit<
          ZoomMeetingWithPastInstancies,
          "id" | "created_at"
        >
      ) => {
        const { past_instances, ...restOfMeeting } = updatedMeetingData;

        // Update meeting basic data
        const updatedMeeting = await updateZoomMeetingById(meeting.id!, {
          ...currentMeeting,
          ...restOfMeeting,
          occurrences: updatedMeetingData?.occurrences?.map((occurrence) => {
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

        // Handle past instances (both new and existing)
        if (past_instances && past_instances.length > 0) {
          // Process new instances
          await get().processNewPastInstances(
            meeting.id!,
            account,
            past_instances
          );

          // Update existing instances with fresh data
          await get().updateExistingPastInstances(
            meeting.id!,
            account,
            past_instances
          );
        }

        // Update state
        set({
          meetings: get().meetings.map((m) =>
            m.id === currentMeeting.id ? updatedMeeting : m
          ),
        });
      },

      handleNonRecurrentMeetingUpdate: async (
        meeting: Partial<ZoomMeetingT>,
        account: Partial<ZoomAccountT>,
        currentMeeting: ZoomMeetingT,
        updatedMeetingData: Partial<ZoomMeetingT>
      ) => {
        const meetingStartTime = new Date(
          updatedMeetingData.start_time || 0
        ).getTime();
        const currentTime = new Date().getTime();

        let finalMeetingData = { ...updatedMeetingData };

        // If meeting has already happened, fetch participants and poll results
        if (meetingStartTime < currentTime) {
          const [participants, pollResults] = await Promise.all([
            useZoomAPIStore
              .getState()
              .getAllParticipantsByMeetingIdFromAPI(
                account,
                meeting.meeting_id!
              ),
            useZoomAPIStore
              .getState()
              .getAllPollResultsByMeetingIdFromAPI(
                account,
                meeting.meeting_id!
              ),
          ]);

          finalMeetingData = {
            ...finalMeetingData,
            participants: participants || [],
            poll_results: pollResults || [],
          };
        }

        const updatedMeeting = await updateZoomMeetingById(meeting.id!, {
          ...currentMeeting,
          ...finalMeetingData,
          occurrences: finalMeetingData?.occurrences?.map(
            (occurrence: ZoomMeetingOccurrenceT) => {
              const currentOccurrence = currentMeeting?.occurrences?.find(
                (currentOccurrence) =>
                  currentOccurrence.occurrence_id === occurrence.occurrence_id
              );
              return currentOccurrence
                ? { ...occurrence, ...currentOccurrence }
                : occurrence;
            }
          ),
          synchronized_at: new Date().toISOString(),
        });

        if (!updatedMeeting) throw new Error("no meeting update response");

        set({
          meetings: get().meetings.map((m) =>
            m.id === currentMeeting.id ? updatedMeeting : m
          ),
        });
      },

      processNewPastInstances: async (
        meetingId: string,
        account: Partial<ZoomAccountT>,
        pastInstances: Partial<ZoomMeetingPastInstanceT>[]
      ) => {
        // Get existing past instances to avoid duplicates
        const existingPastInstances = await useZoomMeetingPastInstanceStore
          .getState()
          .getAllPastInstancesByMeeting(meetingId);

        if (!existingPastInstances) return;

        const currentPastInstances =
          useZoomMeetingPastInstanceStore.getState().pastInstances;
        const existingUuids = new Set(
          currentPastInstances.map((instance) => instance.uuid)
        );

        // Filter only new instances that don't exist in database
        const newPastInstances = pastInstances.filter(
          (instance) => instance.uuid && !existingUuids.has(instance.uuid)
        );

        if (newPastInstances.length === 0) return;

        // Fetch participants and poll results for new instances only
        const enrichedPastInstances = await get().fetchNewPastInstancesData(
          account,
          newPastInstances,
          existingUuids
        );

        // Get classroom participants for visibility logic
        const classroomParticipantsEmails = useUsersStore
          .getState()
          .users.filter((user) =>
            user.profile?.classrooms
              ?.map((c) => c.classroom_id)
              .includes(account.classroom_id || "")
          )
          .map((user) => user.email)
          .filter((email): email is string => email !== undefined);

        const hasClassroomEmails = classroomParticipantsEmails?.length ?? 0 > 1;

        // Process new instances with participants and poll results
        const pastInstancesData = enrichedPastInstances.map((instance) => {
          const instanceParticipants = instance.participants ?? [];
          const hasMatchingParticipants =
            hasClassroomEmails && instanceParticipants.length > 1
              ? instanceParticipants.some((p: ZoomMeetingParticipantT) =>
                  classroomParticipantsEmails?.includes(p.user_email)
                )
              : false;

          const hasParticipantsOnInstance = hasClassroomEmails
            ? hasMatchingParticipants
            : instance.is_visible_on_schedule;

          return {
            classroom_id: account.classroom_id!,
            account_id: account.id!,
            meeting_id: meetingId!,
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
      },

      updateExistingPastInstances: async (
        meetingId: string,
        account: Partial<ZoomAccountT>,
        pastInstances: Partial<ZoomMeetingPastInstanceT>[]
      ) => {
        // Get existing past instances
        const existingPastInstances = await useZoomMeetingPastInstanceStore
          .getState()
          .getAllPastInstancesByMeeting(meetingId);

        if (!existingPastInstances) return;

        const currentPastInstances =
          useZoomMeetingPastInstanceStore.getState().pastInstances;
        const existingUuids = new Set(
          currentPastInstances.map((instance) => instance.uuid)
        );

        // Filter only existing instances that need to be updated
        const existingInstancesToUpdate = pastInstances.filter(
          (instance) => instance.uuid && existingUuids.has(instance.uuid)
        );

        if (existingInstancesToUpdate.length === 0) return;

        // Fetch fresh participants and poll results for existing instances
        const enrichedPastInstances = await get().fetchAllPastInstancesData(
          account,
          existingInstancesToUpdate
        );

        // Get classroom participants for visibility logic
        const classroomParticipantsEmails = useUsersStore
          .getState()
          .users.filter((user) =>
            user.profile?.classrooms
              ?.map((c) => c.classroom_id)
              .includes(account.classroom_id || "")
          )
          .map((user) => user.email)
          .filter((email): email is string => email !== undefined);

        const hasClassroomEmails = classroomParticipantsEmails?.length ?? 0 > 1;

        // Process existing instances for update
        const existingInstancesUpdates = enrichedPastInstances
          .map((instance) => {
            const existingInstance = currentPastInstances.find(
              (existing) => existing.uuid === instance.uuid
            );

            if (!existingInstance) return null;

            const instanceParticipants = instance.participants ?? [];
            const hasMatchingParticipants =
              hasClassroomEmails && instanceParticipants.length > 1
                ? instanceParticipants.some((p: ZoomMeetingParticipantT) =>
                    classroomParticipantsEmails?.includes(p.user_email)
                  )
                : false;

            const hasParticipantsOnInstance = hasClassroomEmails
              ? hasMatchingParticipants
              : instance.is_visible_on_schedule;

            return {
              instanceId: existingInstance.id,
              updates: {
                participants: instance.participants || [],
                poll_results: instance.poll_results || [],
                synchronized_at: new Date().toISOString(),
                is_visible_on_schedule: hasParticipantsOnInstance,
              },
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        // Update existing instances with fresh data
        if (existingInstancesUpdates.length > 0) {
          const pastInstanceStore = useZoomMeetingPastInstanceStore.getState();
          for (const { instanceId, updates } of existingInstancesUpdates) {
            await pastInstanceStore.updatePastInstanceById(instanceId, updates);
          }

          toast.success(
            `${existingInstancesUpdates.length} instâncias existentes foram atualizadas com dados frescos!`
          );
        }
      },

      fetchAllPastInstancesData: async (
        account: Partial<ZoomAccountT>,
        pastInstances: Partial<ZoomMeetingPastInstanceT>[]
      ) => {
        const zoomAPIStore = useZoomAPIStore.getState();
        const enrichedInstances = [];

        const loadingToast = toast.loading(
          `Obtendo dados de TODAS as ${pastInstances.length} instâncias passadas...`
        );

        try {
          for (let i = 0; i < pastInstances.length; i++) {
            const instance = pastInstances[i];
            if (!instance.uuid) {
              enrichedInstances.push(instance);
              continue;
            }

            try {
              // Fetch participants and poll results in parallel for each instance
              const [participants, pollResults] = await Promise.all([
                zoomAPIStore.getAllParticipantsByMeetingIdFromAPI(
                  account,
                  instance.uuid
                ),
                zoomAPIStore.getAllPollResultsByMeetingIdFromAPI(
                  account,
                  instance.uuid
                ),
              ]);

              enrichedInstances.push({
                ...instance,
                participants: participants || [],
                poll_results: pollResults || [],
              });
            } catch (error) {
              console.error(`Error processing instance ${i + 1}:`, error);
              // Continue with next instance even if one fails
              enrichedInstances.push({
                ...instance,
                participants: [],
                poll_results: [],
              });
            }
          }

          toast.success(
            `Dados de ${enrichedInstances.length} instâncias obtidos com sucesso!`
          );
          return enrichedInstances;
        } catch (error) {
          console.error("Error fetching all past instances data:", error);
          toast.error("Erro ao obter dados de todas as instâncias passadas");
          return pastInstances.map((instance) => ({
            ...instance,
            participants: [],
            poll_results: [],
          }));
        } finally {
          toast.dismiss(loadingToast);
        }
      },

      fetchNewPastInstancesData: async (
        account: Partial<ZoomAccountT>,
        pastInstances: Partial<ZoomMeetingPastInstanceT>[],
        existingUuids: Set<string>
      ) => {
        const zoomAPIStore = useZoomAPIStore.getState();
        const enrichedInstances = [];

        // Filter only new instances that don't exist in database
        const newInstances = pastInstances.filter(
          (instance) => instance.uuid && !existingUuids.has(instance.uuid)
        );

        if (newInstances.length === 0) {
          toast.info("Nenhuma nova instância encontrada para processar.");
          return [];
        }

        const loadingToast = toast.loading(
          `Obtendo dados de ${newInstances.length} NOVAS instâncias passadas...`
        );

        try {
          for (let i = 0; i < newInstances.length; i++) {
            const instance = newInstances[i];
            if (!instance.uuid) {
              enrichedInstances.push(instance);
              continue;
            }

            try {
              // Fetch participants and poll results in parallel for each new instance
              const [participants, pollResults] = await Promise.all([
                zoomAPIStore.getAllParticipantsByMeetingIdFromAPI(
                  account,
                  instance.uuid
                ),
                zoomAPIStore.getAllPollResultsByMeetingIdFromAPI(
                  account,
                  instance.uuid
                ),
              ]);

              enrichedInstances.push({
                ...instance,
                participants: participants || [],
                poll_results: pollResults || [],
              });
            } catch (error) {
              console.error(`Error processing new instance ${i + 1}:`, error);
              // Continue with next instance even if one fails
              enrichedInstances.push({
                ...instance,
                participants: [],
                poll_results: [],
              });
            }
          }

          toast.success(
            `Dados de ${enrichedInstances.length} novas instâncias obtidos com sucesso!`
          );
          return enrichedInstances;
        } catch (error) {
          console.error("Error fetching new past instances data:", error);
          toast.error("Erro ao obter dados das novas instâncias passadas");
          return newInstances.map((instance) => ({
            ...instance,
            participants: [],
            poll_results: [],
          }));
        } finally {
          toast.dismiss(loadingToast);
        }
      },

      refreshAllPastInstancesForMeeting: async (meeting, account) => {
        let loadingToastId;
        try {
          if (
            !account.account_id ||
            !account.id ||
            !account.client_id ||
            !account.client_secret
          )
            throw new Error("Account data is missing");
          if (!meeting.id || !meeting.meeting_id || !meeting.uuid)
            throw new Error("Meeting data is missing");

          loadingToastId = toast.loading(
            "Buscando todas as instâncias passadas da reunião...",
            {
              closeButton: true,
            }
          );

          // Get meeting data from Zoom API with all past instances
          const updatedMeetingData = await useZoomAPIStore
            .getState()
            .getMeetingByAPI(account, meeting);

          if (!updatedMeetingData) throw new Error("no meeting response");

          // Check if it's a recurrent meeting with past instances
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
            const { past_instances } = meetingWithPastInstances;

            if (past_instances && past_instances.length > 0) {
              // Fetch participants and poll results for ALL instances
              const enrichedPastInstances =
                await get().fetchAllPastInstancesData(account, past_instances);

              // Get classroom participants for visibility logic
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
                classroomParticipantsEmails?.length ?? 0 > 1;

              // Process all instances with participants and poll results
              const pastInstancesData = enrichedPastInstances.map(
                (instance) => {
                  const instanceParticipants = instance.participants ?? [];
                  const hasMatchingParticipants =
                    hasClassroomEmails && instanceParticipants.length > 1
                      ? instanceParticipants.some(
                          (p: ZoomMeetingParticipantT) =>
                            classroomParticipantsEmails?.includes(p.user_email)
                        )
                      : false;

                  const hasParticipantsOnInstance = hasClassroomEmails
                    ? hasMatchingParticipants
                    : instance.is_visible_on_schedule;

                  return {
                    classroom_id: account.classroom_id!,
                    account_id: account.id!,
                    meeting_id: meeting.id!,
                    uuid: instance.uuid,
                    start_time: instance.start_time,
                    class_type: instance.class_type,
                    participants: instance.participants || [],
                    poll_results: instance.poll_results || [],
                    justifications: instance.justifications || [],
                    synchronized_at: new Date().toISOString(),
                    is_visible_on_schedule: hasParticipantsOnInstance,
                  };
                }
              );

              // Get existing instances from the store
              const pastInstanceStore =
                useZoomMeetingPastInstanceStore.getState();
              await pastInstanceStore.getAllPastInstancesByMeeting(meeting.id!);
              const existingInstances = pastInstanceStore.pastInstances;

              // Separate new and existing instances
              const newInstancesToCreate = pastInstancesData.filter(
                (instanceData) =>
                  !existingInstances.some(
                    (existing) => existing.uuid === instanceData.uuid
                  )
              );

              const existingInstancesToUpdate = enrichedPastInstances
                .map((instance) => {
                  // Find existing instance by UUID
                  const existingInstance = existingInstances.find(
                    (existing) => existing.uuid === instance.uuid
                  );

                  if (existingInstance && instance.uuid) {
                    const instanceParticipants = instance.participants ?? [];
                    const hasMatchingParticipants =
                      hasClassroomEmails && instanceParticipants.length > 1
                        ? instanceParticipants.some(
                            (p: ZoomMeetingParticipantT) =>
                              classroomParticipantsEmails?.includes(
                                p.user_email
                              )
                          )
                        : false;

                    const hasParticipantsOnInstance = hasClassroomEmails
                      ? hasMatchingParticipants
                      : instance.is_visible_on_schedule;

                    return {
                      instanceId: existingInstance.id,
                      updates: {
                        participants: instance.participants || [],
                        poll_results: instance.poll_results || [],
                        synchronized_at: new Date().toISOString(),
                        is_visible_on_schedule: hasParticipantsOnInstance,
                      },
                    };
                  }
                  return null;
                })
                .filter(
                  (item): item is NonNullable<typeof item> => item !== null
                );

              // Create new instances if any
              if (newInstancesToCreate.length > 0) {
                await pastInstanceStore.createMultiplePastInstances(
                  newInstancesToCreate
                );
              }

              // Update existing instances with fresh data from API (no additional API calls needed)
              if (existingInstancesToUpdate.length > 0) {
                for (const {
                  instanceId,
                  updates,
                } of existingInstancesToUpdate) {
                  await pastInstanceStore.updatePastInstanceById(
                    instanceId,
                    updates
                  );
                }
              }

              const totalProcessed =
                newInstancesToCreate.length + existingInstancesToUpdate.length;
              toast.success(
                `Todas as ${totalProcessed} instâncias passadas foram processadas (${newInstancesToCreate.length} novas, ${existingInstancesToUpdate.length} atualizadas)!`
              );
            } else {
              toast.info(
                "Nenhuma instância passada encontrada para esta reunião."
              );
            }
          } else {
            toast.info(
              "Esta reunião não é recorrente ou não possui instâncias passadas."
            );
          }

          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao atualizar todas as instâncias passadas!");
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
