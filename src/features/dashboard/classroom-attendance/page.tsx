"use client";
import { useParams } from "next/navigation";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";
import { useUsersStore } from "@/stores/modules/users/users-store";
import { ZoomMeetingPastInstanceT } from "@/types/zoom/past-instances";
import AttendanceTable from "./components/attendance-table";
import { ZoomMeetingT } from "@/types/zoom";

export default function AttendancePage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const { users } = useUsersStore();
  const { meetings } = useZoomMeetingStore();
  const { pastInstances } = useZoomMeetingPastInstanceStore();

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  // Get past instances directly from the store and add meeting info
  const pastsMeetings: ZoomMeetingPastInstanceT[] = pastInstances
    .map((pastInstance) => ({
      ...pastInstance,
      meeting_type: "pastInstance",
    }))
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

  const allPastsMeetings = [
    ...pastsMeetings,
    ...meetings
      .filter(
        (meeting) =>
          meeting.type !== 8 &&
          new Date(meeting.start_time || 0).getTime() < Date.now()
      )
      .flatMap((meeting) => ({ ...meeting, meeting_type: "meeting" })),
  ].sort(
    (a, b) =>
      new Date(b.start_time || 0).getTime() -
      new Date(a.start_time || 0).getTime()
  );

  return (
    <div className="w-full h-full p-6">
      <AttendanceTable
        users={classroomUsers}
        meetings={
          allPastsMeetings as (
            | (ZoomMeetingPastInstanceT & {
                meeting_type: "meeting" | "pastInstance";
              })
            | (ZoomMeetingT & { meeting_type: "meeting" | "pastInstance" })
          )[]
        }
      />
    </div>
  );
}
