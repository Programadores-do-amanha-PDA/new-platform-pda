"use client";
import { useParams } from "next/navigation";
import { useUsersStore } from "@/features/users/management";

import { filterVisibilityClassroomStudents } from "../classrooms/utils";
import PollResultsTable from "../classroom-satisfaction/components/poll-results-table";
import { useClassroomSettingStore } from "../classrooms/settings";
import { useEnrollmentsManagementStore } from "../enrollments";
import { useZoomMeetingStore } from "../classroom-zoom/stores/meetings";
import { useZoomMeetingPastInstanceStore } from "../classroom-zoom/stores/past-instances";
import { ZoomMeeting } from "../classroom-zoom/types/meetings";
import { ZoomMeetingPastInstance } from "../classroom-zoom/types/past-instances";

export default function PollResultsPage() {
    const { classroom_id } = useParams<{ classroom_id: string }>();

    const { users } = useUsersStore();
    const { meetings } = useZoomMeetingStore();
    const { pastInstances } = useZoomMeetingPastInstanceStore();
    const { settingsByClassroom } = useClassroomSettingStore();
    const { enrollmentsByUserId } = useEnrollmentsManagementStore();

    if (!classroom_id) {
        return <div>Turma não encontrada.</div>;
    }

    const classroomConfigUserModes = settingsByClassroom[classroom_id]?.user_modes || [];

    const allVisibleUsers = filterVisibilityClassroomStudents({
        users,
        classroomId: classroom_id,
        userModes: classroomConfigUserModes,
        ruleId: "activities",
        enrollmentsByUserId,
    });

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
