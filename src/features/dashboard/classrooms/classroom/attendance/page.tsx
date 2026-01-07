"use client";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useUsersStore } from "@/features/dashboard/shared/users/store";

import AttendanceTable from "./components/attendance-table";
import { ZoomMeetingPastInstance } from "../integrations/zoom/types";
import { useZoomMeetingStore, useZoomMeetingPastInstanceStore } from "../integrations/zoom/stores";
import { ZoomPastMeetingAndPastInstanciesAttendance } from "./types";
import { filterVisibilityClassroomStudents, filterMetricClassroomStudents } from "../../shared/utils";
import { useClassroomSettingStore } from "../settings";

export default function AttendancePage() {
    const { classroom_id } = useParams<{ classroom_id: string }>();

    const { users } = useUsersStore();
    const { meetings } = useZoomMeetingStore();
    const { pastInstances } = useZoomMeetingPastInstanceStore();
    const { settingsByClassroom } = useClassroomSettingStore();

    const allPastsMeetings = useMemo(() => {
        // eslint-disable-next-line
        const now = Date.now();

        // Get past instances directly from the store and add meeting info
        const pastsMeetings: ZoomMeetingPastInstance[] = pastInstances
            ?.map((pastInstance) => ({
                ...pastInstance,
                meeting_type: "pastInstance",
            }))
            .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime());

        return [
            ...pastsMeetings,
            ...meetings
                .filter((meeting) => meeting.type !== 8 && new Date(meeting.start_time || 0).getTime() < now)
                .flatMap((meeting) => ({ ...meeting, meeting_type: "meeting" })),
        ]
            .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime())
            .filter((m) => m.is_visible_on_schedule === true);
    }, [meetings, pastInstances]);

    if (!classroom_id) {
        return <div>Turma não encontrada.</div>;
    }

    const userModes = settingsByClassroom[classroom_id]?.user_modes || [];

    const allVisibleUsers = filterVisibilityClassroomStudents(users, classroom_id, userModes, "attendance");

    const allAggregateInMetricUsers = filterMetricClassroomStudents(users, classroom_id, userModes, "attendance");

    return (
        <div className="p-4 w-full h-full">
            <AttendanceTable
                allVisibleUsers={allVisibleUsers}
                allAggregateInMetricUsers={allAggregateInMetricUsers}
                meetings={allPastsMeetings as ZoomPastMeetingAndPastInstanciesAttendance[]}
                classroomId={classroom_id}
            />
        </div>
    );
}
