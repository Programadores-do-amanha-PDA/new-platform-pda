"use client";
import { useParams } from "next/navigation";
import { useUsersStore } from "@/features/dashboard/shared/users/store";

import PollResultsTable from "./components/poll-results-table";
import { ZoomMeeting, ZoomMeetingPastInstance } from "../integrations/zoom/types";
import { useZoomMeetingStore, useZoomMeetingPastInstanceStore } from "../integrations/zoom/stores";
import { filterVisibilityClassroomStudents } from "../../shared/utils";
import { useClassroomSettingStore } from "../settings";

export default function PollResultsPage() {
    const { classroom_id } = useParams<{ classroom_id: string }>();

    const { users } = useUsersStore();
    const { meetings } = useZoomMeetingStore();
    const { pastInstances } = useZoomMeetingPastInstanceStore();
    const { settingsByClassroom } = useClassroomSettingStore();

    if (!classroom_id) {
        return <div>Turma não encontrada.</div>;
    }

    const classroomConfigUserModes = settingsByClassroom[classroom_id]?.user_modes || [];

    const allVisibleUsers = filterVisibilityClassroomStudents(users, classroom_id, classroomConfigUserModes, "activities");

    // Get past instances directly from the store and add meeting info
    const pastsMeetings: ZoomMeetingPastInstance[] = pastInstances
        .map((pastInstance) => ({
            ...pastInstance,
            meeting_type: "pastInstance",
        }))
        .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime());

    const allPastsMeetings = [
        ...pastsMeetings,
        ...meetings
            .filter((meeting) => meeting.type !== 8 && new Date(meeting.start_time || 0).getTime() < new Date().getTime())
            .flatMap((meeting) => ({ ...meeting, meeting_type: "meeting" })),
    ]
        .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime())
        .filter((m) => m.is_visible_on_schedule === true);

    return (
        <div className="p-4 w-full h-full">
            <PollResultsTable
                allVisibleUsers={allVisibleUsers}
                meetings={
                    allPastsMeetings as (
                        | (ZoomMeetingPastInstance & {
                              meeting_type: "meeting" | "pastInstance";
                          })
                        | (ZoomMeeting & { meeting_type: "meeting" | "pastInstance" })
                    )[]
                }
                classroomId={classroom_id}
            />
        </div>
    );
}
