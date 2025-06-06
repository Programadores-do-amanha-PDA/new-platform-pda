"use client";

import AttendanceTable from "@/components/common/classrooms/attendance/attendance-table";
import { useAdminStackContext } from "@/context/admin/stack-context";
import {
  ZoomMeetingPastInstancesType,
  ZoomMeetingType,
} from "@/types/zoom/meetings";
import { useParams } from "next/navigation";

type ZoomMeetingWithType =
  | (ZoomMeetingType & { meeting_type: "meeting" })
  | (ZoomMeetingPastInstancesType & { meeting_type: "pastInstance" });

const ClassroomAttendancePage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const {
    usersStack: { users },
    classroomsStack: {
      zoom: {
        meetings: {
          meetings,
          pastInstances: { pastInstances },
        },
      },
    },
  } = useAdminStackContext();

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  // Corrigido: pastsMeetings agora é um array com tipos específicos para cada caso
  const pastsMeetings: ZoomMeetingWithType[] = [
    ...meetings.map(
      (m): ZoomMeetingWithType => ({ ...m, meeting_type: "meeting" })
    ),
    ...pastInstances.map(
      (p): ZoomMeetingWithType => ({ ...p, meeting_type: "pastInstance" })
    ),
  ]
    .filter((m) => new Date(m.start_time || 0).getTime() <= Date.now())
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
      <AttendanceTable users={classroomUsers} pastMeetings={pastsMeetings} />
    </div>
  );
};

export default ClassroomAttendancePage;
