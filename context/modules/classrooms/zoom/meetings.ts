import {
  getZoomMeetingById,
  getAllZoomMeetingsByClassroomId,
  updateZoomMeetingById,
  deleteZoomMeetingById,
  createZoomMeetingByClassroomId,
} from "@/app/actions/classrooms/zoom/meetings";
import { ZoomAccountType } from "@/types/zoom/accounts";
import {
  ZoomMeetingOccurrenceType,
  ZoomMeetingPastInstancesType,
  ZoomMeetingType,
} from "@/types/zoom/meetings";
import { useState } from "react";
import { toast } from "sonner";

const useZoomMeetingsStack = ({
  handleGetZoomMeetingByAPI,
  pastInstances,
  handleCreateManyZoomPastInstance,
  handleUpdateZoomPastInstance,
}: {
  handleGetZoomMeetingByAPI: (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >,
    id: number
  ) => Promise<Omit<ZoomMeetingType, "id"> | null>;
  pastInstances: ZoomMeetingPastInstancesType[];
  handleCreateManyZoomPastInstance: (
    instanciesData: Partial<ZoomMeetingPastInstancesType>[]
  ) => Promise<boolean>;
  handleUpdateZoomPastInstance: (
    id: string,
    updates: Partial<ZoomMeetingPastInstancesType>
  ) => Promise<boolean>;
}) => {
  const [meetings, setMeetings] = useState<ZoomMeetingType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllZoomMeetings = async (classroomId: string) => {
    try {
      setLoading(true);
      const meetingsResponse = await getAllZoomMeetingsByClassroomId(
        classroomId
      );
      if (!meetingsResponse) throw "no meetings response";
      setMeetings(meetingsResponse);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetZoomMeetingById = async (id: string) => {
    try {
      setLoading(true);
      const meetingResponse = await getZoomMeetingById(id);
      if (!meetingResponse) throw "no meeting response";
      return meetingResponse as ZoomMeetingType;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZoomMeeting = async (
    account: Omit<ZoomAccountType, "me" | "label" | "created_at">,
    meetingData: Partial<ZoomMeetingType>
  ) => {
    let loadingToastId;
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

      loadingToastId = toast.loading("Pegando os dados da reunião...");
      const allMeetingDataByAPI = await handleGetZoomMeetingByAPI(
        account,
        meetingData.meeting_id
      );
      toast.dismiss(loadingToastId);
      if (!allMeetingDataByAPI) throw new Error("no meeting response");

      const { past_instances, ...meetingDataByAPI } = allMeetingDataByAPI;
      loadingToastId = toast.loading("Salvando os dados da reunião...");
      const newMeeting = await createZoomMeetingByClassroomId({
        ...meetingData,
        account_id: account.id,
        classroom_id: account.classroom_id,
        synchronized_at: new Date().toISOString(),
        ...meetingDataByAPI,
      });
      toast.dismiss(loadingToastId);
      if (!newMeeting) throw new Error("no meeting create response");

      if (meetingDataByAPI.type === 8 && past_instances.length > 0) {
        await handleCreateManyZoomPastInstance(
          past_instances.map((p) => ({
            ...p,
            account_id: account.id,
            classroom_id: account.classroom_id,
            meeting_id: newMeeting.id,
            synchronized_at: new Date().toISOString(),
          }))
        );
      }

      setMeetings((meetings) => [newMeeting, ...meetings]);
      toast.success(`Reunião "${newMeeting.topic}" criada com sucesso!`);
      return newMeeting.id as string;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar nova reunião!");
      return false;
    } finally {
      toast.dismiss(loadingToastId);
    }
  };

  const handleUpdateZoomMeeting = async (
    id: string,
    updates: Partial<ZoomMeetingType>
  ) => {
    try {
      if (!id || !updates) {
        throw new Error("id and updates fields are required");
      }
      const updatedMeeting = await updateZoomMeetingById(id, updates);
      if (!updatedMeeting) throw new Error("no update meeting response");

      setMeetings((meetings) =>
        meetings.map((meeting) =>
          meeting.id === id ? updatedMeeting : meeting
        )
      );
      toast.success("Reunião atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar a reunião!");
      return false;
    }
  };

  const handleUpdateZoomMeetingOccurrence = async (
    id: string,
    occurrenceId: string,
    updates: Partial<ZoomMeetingOccurrenceType>
  ) => {
    try {
      if (!id || !occurrenceId || !updates) {
        throw new Error("id and updates fields are required");
      }
      const currentMeeting = meetings.find((meeting) => meeting.id === id);
      const updatedOccurrences = currentMeeting?.occurrences?.map(
        (occurrence) =>
          occurrence.occurrence_id === occurrenceId
            ? { ...occurrence, ...updates }
            : occurrence
      );
      const updatedMeeting: ZoomMeetingType | false =
        await updateZoomMeetingById(id, {
          occurrences: updatedOccurrences,
        });
      if (!updatedMeeting) throw new Error("no update meeting response");

      setMeetings((meetings) =>
        meetings.map((meeting) =>
          meeting.id === id ? updatedMeeting : meeting
        )
      );
      toast.success("Reunião atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar a reunião!");
      return false;
    }
  };

  const handleRefreshAndUpdateZoomMeeting = async (
    id: string,
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >
  ) => {
    let loadingToastId;
    try {
      if (
        !id ||
        !account.account_id ||
        !account.client_id ||
        !account.client_secret
      ) {
        throw new Error("id and updates fields are required");
      }

      const currentMeeting = meetings.find((meeting) => meeting.id === id);
      if (!currentMeeting || !currentMeeting.meeting_id)
        throw new Error("no meeting found");

      loadingToastId = toast.loading("Atualizando dados da reunião...");
      const updatedMeetingResponse = await handleGetZoomMeetingByAPI(
        account,
        currentMeeting?.meeting_id
      );
      if (!updatedMeetingResponse) throw new Error("no meeting response");

      const { past_instances, ...updatedMeetingData } = updatedMeetingResponse;
      const updatedMeeting = await updateZoomMeetingById(id, {
        ...currentMeeting,
        ...updatedMeetingData,
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
      if (!updatedMeeting) throw new Error("no meeting create response");

  if (updatedMeeting.type === 8) {
        const updatedPastInstances = pastInstances
          .map((pastInstance) => {
            const currentParticipants = new Set(
              pastInstance?.participants?.map((p) => p?.user_email) ?? []
            );
            const currentPollResults = new Set(
              pastInstance?.poll_results?.map((p) => p?.email) ?? []
            );

            const matchingInstance = past_instances.find(
              (m) => m.uuid === pastInstance?.uuid
            );

            if (!matchingInstance) return null;

            const hasParticipantChanges =
              matchingInstance.participants?.length !==
                pastInstance?.participants?.length ||
              matchingInstance.participants?.some(
                (p) => p?.user_email && !currentParticipants.has(p.user_email)
              );

            const hasPollResultChanges =
              matchingInstance.poll_results?.length !==
                pastInstance?.poll_results?.length ||
              matchingInstance.poll_results?.some(
                (p) => p?.email && !currentPollResults.has(p.email)
              );

            if (!hasParticipantChanges && !hasPollResultChanges) return null;

            return {
              id: pastInstance.id,
              participants:
                matchingInstance.participants || pastInstance?.participants,
              poll_results:
                matchingInstance.poll_results || pastInstance?.poll_results,
            };
          })
          .filter(Boolean);

        if (updatedPastInstances?.length > 0) {
          for (const updatedPastInstance of updatedPastInstances) {
            if (!updatedPastInstance) continue;
            const { id, ...updates } = updatedPastInstance;
            await handleUpdateZoomPastInstance(id, updates);
          }
        }

        const newInstances = past_instances.filter(
          (m) => m?.uuid && !pastInstances.some((p) => p?.uuid === m.uuid)
        );

        if (newInstances?.length) {
          await handleCreateManyZoomPastInstance(newInstances);
        }
      }

      setMeetings((meetings) =>
        meetings.map((meeting) =>
          meeting.id === currentMeeting?.id ? updatedMeeting : meeting
        )
      );
      toast.success("Dados da reunião atualizados com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar dados da reunião!");
      return false;
    } finally {
      toast.dismiss(loadingToastId);
    }
  };

  const handleDeleteZoomMeeting = async (id: string) => {
    try {
      if (!id) throw new Error("meeting id is required to delete");
      setLoading(true);
      const response = await deleteZoomMeetingById(id);
      if (!response) throw new Error("no delete meeting response");

      setMeetings((meetings) =>
        meetings.filter((meeting) => meeting.id !== id)
      );
      toast.success("Reunião deletada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar reunião. Tente novamente mais tarde!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    meetings,
    setMeetings,
    meetingsLoading: loading,
    handleGetAllZoomMeetings,
    handleGetZoomMeetingById,
    handleCreateZoomMeeting,
    handleUpdateZoomMeeting,
    handleUpdateZoomMeetingOccurrence,
    handleRefreshAndUpdateZoomMeeting,
    handleDeleteZoomMeeting,
  };
};

export default useZoomMeetingsStack;

export interface ZoomMeetingsStackI {
  meetings: ZoomMeetingType[];
  meetingsLoading: boolean;
  handleGetAllZoomMeetings: (classroomId: string) => Promise<boolean>;
  handleGetZoomMeetingById: (id: string) => Promise<false | ZoomMeetingType>;
  handleCreateZoomMeeting: (
    account: Omit<ZoomAccountType, "me" | "label" | "created_at">,
    meetingData: Partial<ZoomMeetingType>
  ) => Promise<string | false>;
  handleUpdateZoomMeeting: (
    id: string,
    updates: Partial<ZoomMeetingType>
  ) => Promise<boolean>;
  handleUpdateZoomMeetingOccurrence: (
    id: string,
    occurrenceId: string,
    updates: Partial<ZoomMeetingOccurrenceType>
  ) => Promise<boolean>;
  handleRefreshAndUpdateZoomMeeting: (
    id: string,
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >
  ) => Promise<boolean>;
  handleDeleteZoomMeeting: (id: string) => Promise<boolean>;
}
