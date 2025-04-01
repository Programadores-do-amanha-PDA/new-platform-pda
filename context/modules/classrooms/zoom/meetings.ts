import {
  getZoomMeetingById,
  getAllZoomMeetingsByClassroomId,
  updateZoomMeetingById,
  deleteZoomMeetingById,
  createZoomMeetingByClassroomId,
} from "@/app/actions/classrooms/zoom/meetings";
import { ZoomMeetingType } from "@/types/zoom/meettings";
import { useState } from "react";
import { toast } from "sonner";

const useZoomMeetingsStack = () => {
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
    meetingData: Partial<ZoomMeetingType>
  ) => {
    try {
      if (
        !meetingData.classroom_id ||
        !meetingData.topic ||
        !meetingData.start_time
      ) {
        toast.error("Dados obrigatórios da reunião estão faltando!");
        throw new Error("missing required meeting data");
      }

      setLoading(true);
      const newMeeting = await createZoomMeetingByClassroomId(meetingData);

      if (!newMeeting) throw new Error("no meeting create response");

      setMeetings((meetings) => [newMeeting, ...meetings]);
      toast.success(`Reunião "${newMeeting.topic}" criada com sucesso!`);
      return newMeeting.id;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar nova reunião!");
      return false;
    } finally {
      setLoading(false);
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
      setLoading(true);
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
    } finally {
      setLoading(false);
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
    meetingData: Partial<ZoomMeetingType>
  ) => Promise<number | boolean>;
  handleUpdateZoomMeeting: (
    meetingId: number,
    updates: Partial<ZoomMeetingType>
  ) => Promise<boolean>;
  handleDeleteZoomMeeting: (meetingId: number) => Promise<boolean>;
}
