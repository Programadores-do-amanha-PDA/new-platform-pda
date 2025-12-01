"use client";
import { useParams } from "next/navigation";
import { useClassroomConfigStore } from "@/features/dashboard/classroom-configs/stores";
import { useUsersStore } from "@/stores/modules/users/users-store";

import PollResultsTable from "./components/poll-results-table";
import {
  ZoomMeetingT,
  ZoomMeetingPastInstanceT,
} from "../classroom-zoom/types";
import { filterVisibilityClassroomStudents } from "../utils/filter-visibility-classroom-students";
import {
  useZoomMeetingStore,
  useZoomMeetingPastInstanceStore,
} from "../classroom-zoom/stores";

export default function PollResultsPage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();

  const { users } = useUsersStore();
  const { meetings } = useZoomMeetingStore();
  const { pastInstances } = useZoomMeetingPastInstanceStore();
  const { configsByClassroom } = useClassroomConfigStore();

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  const classroomConfigUserModes =
    configsByClassroom[classroom_id]?.user_modes || [];

  const allVisibleUsers = filterVisibilityClassroomStudents(
    users,
    classroom_id,
    classroomConfigUserModes,
    "activities"
  );

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

  const allPastsMeetings = [
    ...pastsMeetings,
    ...meetings
      .filter(
        (meeting) =>
          meeting.type !== 8 &&
          new Date(meeting.start_time || 0).getTime() < Date.now()
      )
      .flatMap((meeting) => ({ ...meeting, meeting_type: "meeting" })),
  ]
    .sort(
      (a, b) =>
        new Date(b.start_time || 0).getTime() -
        new Date(a.start_time || 0).getTime()
    )
    .filter((m) => m.is_visible_on_schedule === true);

  return (
    <div className="w-full h-full p-4">
      <PollResultsTable
        allVisibleUsers={allVisibleUsers}
        meetings={
          allPastsMeetings as (
            | (ZoomMeetingPastInstanceT & {
                meeting_type: "meeting" | "pastInstance";
              })
            | (ZoomMeetingT & { meeting_type: "meeting" | "pastInstance" })
          )[]
        }
        classroomId={classroom_id}
      />
    </div>
  );
}
