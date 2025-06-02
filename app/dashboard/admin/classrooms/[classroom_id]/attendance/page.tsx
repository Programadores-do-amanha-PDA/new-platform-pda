"use client";
import AttendanceTable from "@/components/common/classrooms/attendance/attendance-table";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { ZoomMeetingPastInstancesType } from "@/types/zoom/meetings";
import { useParams } from "next/navigation";
const ClassroomAttendancePage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();

  const {
    usersStack: { users },
    classroomsStack: {
      zoom: {
        meetings: { meetings },
      },
    },
  } = useAdminStackContext();

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  const pastsMeetings: ZoomMeetingPastInstancesType[] = meetings
    .flatMap((meeting) => {
      if (meeting.type === 8) {
        return meeting.past_instances.flatMap((p) => ({
          meetingId: meeting.id,
          ...p,
        }));
      } else if (
        new Date(meeting.start_time || 0).getTime() < new Date().getTime()
      ) {
        return {
          meetingId: meeting.id,
          uuid: undefined,
          start_time: meeting.start_time || 0,
          participants: meeting.participants || [],
          poll_results: meeting.poll_results || [],
          justifications: meeting.justifications || [],
        } as ZoomMeetingPastInstancesType;
      }
      return [];
    })
    .sort(
      (a, b) =>
        new Date(b.start_time || 0).getTime() -
        new Date(a.start_time || 0).getTime()
    );

  const classroomUsers = users.filter(
    (user) =>
      user.profile?.classrooms
        ?.map((c) => c.classroom_id)
        ?.includes(classroom_id) &&
      user.profile?.user_roles?.map((r) => r.role).includes("student")
  );

  return (
    <div className="w-full h-full p-6">
      <AttendanceTable users={classroomUsers} meetings={pastsMeetings} />
    </div>
  );
};

export default ClassroomAttendancePage;
