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
  ZoomMeetingType,
} from "@/types/zoom/meetings";
import { useState } from "react";
import { toast } from "sonner";

const useZoomMeetingsStack = ({
  handleGetZoomMeetingByAPI,
}: {
  handleGetZoomMeetingByAPI: (
    account: Partial<ZoomAccountType>,
    id: number
  ) => Promise<ZoomMeetingType | null>;
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
      return meetingResponse;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZoomMeeting = async (
    account: Partial<ZoomAccountType>,
    meetingData: Partial<ZoomMeetingType>
  ) => {
    try {
      if (
        !meetingData.meeting_id ||
        !account.account_id ||
        !account.client_id ||
        !account.client_secret
      ) {
        toast.error("Dados obrigatórios da reunião estão faltando!");
        throw new Error("missing required meeting data");
      }

      const meeting = await handleGetZoomMeetingByAPI(
        account,
        meetingData.meeting_id
      );
      if (!meeting) throw new Error("no meeting response");

      const newMeeting = await createZoomMeetingByClassroomId({
        ...meetingData,
        account_id: account.id,
        classroom_id: account.classroom_id,
        synchronized_at: new Date().toString(),
        ...meeting,
      });

      if (!newMeeting) throw new Error("no meeting create response");

      setMeetings((meetings) => [newMeeting, ...meetings]);
      toast.success(`Reunião "${newMeeting.topic}" criada com sucesso!`);
      return newMeeting.id as string;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar nova reunião!");
      return false;
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
    account: Partial<ZoomAccountType>
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
      const meetingData = await handleGetZoomMeetingByAPI(
        account,
        currentMeeting?.meeting_id
      );
      if (!meetingData) throw new Error("no meeting response");

      const updatedMeeting = await updateZoomMeetingById(id, {
        ...currentMeeting,
        ...meetingData,
        past_instances:
          currentMeeting && currentMeeting?.past_instances?.length > 0
            ? currentMeeting.past_instances.map((past_instance) => {
                const updatedPastInstance = meetingData?.past_instances?.find(
                  (updatedInstance) =>
                    updatedInstance.uuid === past_instance.uuid
                );
                return updatedPastInstance
                  ? { ...past_instance, ...updatedPastInstance }
                  : past_instance;
              })
            : meetingData?.past_instances || [],
        occurrences: meetingData?.occurrences?.map((occurrence) => {
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
  handleGetZoomMeetingById: (id: string) => Promise<ZoomMeetingType | boolean>;
  handleCreateZoomMeeting: (
    account: Partial<ZoomAccountType>,
    meeting_id: Partial<ZoomMeetingType>
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
    account: Partial<ZoomAccountType>
  ) => Promise<boolean>;
  handleDeleteZoomMeeting: (id: string) => Promise<boolean>;
}
