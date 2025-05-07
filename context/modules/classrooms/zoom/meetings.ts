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
    meetingId: number
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

  const handleGetZoomMeetingById = async (meetingId: number) => {
    try {
      setLoading(true);
      const meetingResponse = await getZoomMeetingById(meetingId);
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
        !meetingData.id ||
        !account.account_id ||
        !account.client_id ||
        !account.client_secret
      ) {
        toast.error("Dados obrigatórios da reunião estão faltando!");
        throw new Error("missing required meeting data");
      }

      const meeting = await handleGetZoomMeetingByAPI(account, meetingData.id);
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
    meetingId: number,
    updates: Partial<ZoomMeetingType>
  ) => {
    try {
      if (!meetingId || !updates) {
        throw new Error("id and updates fields are required");
      }
      const updatedMeeting = await updateZoomMeetingById(meetingId, updates);
      if (!updatedMeeting) throw new Error("no update meeting response");

      setMeetings((meetings) =>
        meetings.map((meeting) =>
          meeting.id === meetingId ? updatedMeeting : meeting
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
    meetingId: number,
    occurrenceId: string,
    updates: Partial<ZoomMeetingOccurrenceType>
  ) => {
    try {
      if (!meetingId || !occurrenceId || !updates) {
        throw new Error("id and updates fields are required");
      }
      const currentMeeting = meetings.find(
        (meeting) => meeting.id === meetingId
      );
      const updatedOccurrences = currentMeeting?.occurrences?.map(
        (occurrence) =>
          occurrence.occurrence_id === occurrenceId
            ? { ...occurrence, ...updates }
            : occurrence
      );
      const updatedMeeting: ZoomMeetingType | false =
        await updateZoomMeetingById(meetingId, {
          occurrences: updatedOccurrences,
        });
      if (!updatedMeeting) throw new Error("no update meeting response");

      setMeetings((meetings) =>
        meetings.map((meeting) =>
          meeting.id === meetingId ? updatedMeeting : meeting
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

  const handleUpdateZoomMeetingPastInstance = async (
    meetingId: number,
    pastInstanceId: string,
    updates: Partial<ZoomMeetingOccurrenceType>
  ) => {
    try {
      if (!meetingId || !pastInstanceId || !updates) {
        throw new Error("id and updates fields are required");
      }
      setLoading(true);
      const currentMeeting = meetings.find(
        (meeting) => meeting.id === meetingId
      );
      const updatedPastsInstancies = currentMeeting?.past_instances?.map(
        (past_instancie) =>
          past_instancie.uuid === pastInstanceId
            ? { ...past_instancie, ...updates }
            : past_instancie
      );
      const updatedMeeting: ZoomMeetingType | false =
        await updateZoomMeetingById(meetingId, {
          past_instances: updatedPastsInstancies,
        });
      if (!updatedMeeting) throw new Error("no update meeting response");

      setMeetings((meetings) =>
        meetings.map((meeting) =>
          meeting.id === meetingId ? updatedMeeting : meeting
        )
      );
      toast.success("Reunião atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar a reunião!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAndUpdateZoomMeeting = async (
    meetingId: number,
    account: Partial<ZoomAccountType>
  ) => {
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

      const currentMeeting = meetings.find(
        (meeting) => meeting.id === meetingId
      );
      const updatedMeeting = await handleGetZoomMeetingByAPI(
        account,
        meetingId
      );
      if (!updatedMeeting) throw new Error("no meeting response");

      const newMeeting = await updateZoomMeetingById(meetingId, {
        ...currentMeeting,
        ...updatedMeeting,
        past_instances:
          currentMeeting && currentMeeting?.past_instances?.length > 0
            ? currentMeeting.past_instances.map((past_instance) => {
                const updatedPastInstance =
                  updatedMeeting?.past_instances?.find(
                    (updatedInstance) =>
                      updatedInstance.uuid === past_instance.uuid
                  );
                return updatedPastInstance
                  ? { ...past_instance, ...updatedPastInstance }
                  : past_instance;
              })
            : updatedMeeting?.past_instances || [],
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

      setMeetings((meetings) =>
        meetings.map((meeting) =>
          meeting._id === currentMeeting?._id ? newMeeting : meeting
        )
      );
      toast.success("Dados da reunião atualizados com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar dados da reunião!");
      return false;
    }
  };

  const handleDeleteZoomMeeting = async (meetingId: number) => {
    try {
      if (!meetingId) throw new Error("meeting id is required to delete");
      setLoading(true);
      const response = await deleteZoomMeetingById(meetingId);
      if (!response) throw new Error("no delete meeting response");

      setMeetings((meetings) =>
        meetings.filter((meeting) => meeting.id !== meetingId)
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
    handleUpdateZoomMeetingPastInstance,
    handleRefreshAndUpdateZoomMeeting,
    handleDeleteZoomMeeting,
  };
};

export default useZoomMeetingsStack;

export interface ZoomMeetingsStackI {
  meetings: ZoomMeetingType[];
  meetingsLoading: boolean;
  handleGetAllZoomMeetings: (classroomId: string) => Promise<boolean>;
  handleGetZoomMeetingById: (
    meetingId: number
  ) => Promise<ZoomMeetingType | boolean>;
  handleCreateZoomMeeting: (
    account: Partial<ZoomAccountType>,
    meeting_id: Partial<ZoomMeetingType>
  ) => Promise<string | false>;
  handleUpdateZoomMeeting: (
    meetingId: number,
    updates: Partial<ZoomMeetingType>
  ) => Promise<boolean>;
  handleUpdateZoomMeetingOccurrence: (
    meetingId: number,
    occurrenceId: string,
    updates: Partial<ZoomMeetingOccurrenceType>
  ) => Promise<boolean>;
  handleUpdateZoomMeetingPastInstance: (
    meetingId: number,
    pastInstanceId: string,
    updates: Partial<ZoomMeetingOccurrenceType>
  ) => Promise<boolean>;
  handleRefreshAndUpdateZoomMeeting: (
    meetingId: number,
    account: Partial<ZoomAccountType>
  ) => Promise<boolean>;
  handleDeleteZoomMeeting: (meetingId: number) => Promise<boolean>;
}
