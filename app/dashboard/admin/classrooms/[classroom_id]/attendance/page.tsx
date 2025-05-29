"use client";
import AttendanceTable from "@/components/common/classrooms/attendance/attendance-table";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { ZoomMeetingPastInstancesType } from "@/types/zoom/meetings";
import { useParams } from "next/navigation";
// import { AuthUserWithProfileType } from "@/types/auth";
// import { useState } from "react";
const AttendancePage = () => {
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
        return meeting.past_instances;
      } else if (
        new Date(meeting.start_time || 0).getTime() < new Date().getTime()
      ) {
        return {
          uuid: meeting.uuid,
          start_time: meeting.start_time || 0,
          participants: meeting.participants || [],
          poll_results: meeting.poll_results || [],
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

  //   const [justificationOpen, setJustificationOpen] = useState(false);
  //   const [justificationText, setJustificationText] = useState('');

  return (
    <div className="w-full h-full p-6">
      <AttendanceTable users={classroomUsers} meetings={pastsMeetings} />
    </div>
  );
};

export default AttendancePage;
