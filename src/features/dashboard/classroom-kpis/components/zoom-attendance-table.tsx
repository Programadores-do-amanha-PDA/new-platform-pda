"use client";

import { useMemo } from "react";
import { useZoomMeetingPastInstanceStore, useZoomMeetingStore } from "../../classroom-zoom/stores";
import { calculateClassPresence, calculateWeeklyClassPresence } from "../../classroom-attendance/utils";
import { useUserClassroomsStore } from "@/stores/modules/users/user-classrooms-store";
import { useClassroomConfigStore } from "../../classroom-configs/stores";
import { filterMetricClassroomStudents } from "../../utils/filter-metric-classroom-students";
import { AttendanceAccumulatorT } from "../types/zoom-attendance.types";
import { MeetingAttendanceT, PastInstancieAttendanceT } from "../../classroom-attendance/types";
import { ZoomAttendanceColumns } from "./zoom-attendance-columns";

export const KPIsZoomAttendanceTable = ({ classroomId }: { classroomId: string }) => {
    const { meetings } = useZoomMeetingStore();
    const { pastInstances } = useZoomMeetingPastInstanceStore();
    const { users } = useUserClassroomsStore();
    const { configsByClassroom } = useClassroomConfigStore();

    const userModes = configsByClassroom[classroomId]?.user_modes || [];
    const classroomClassTypes = configsByClassroom[classroomId]?.class_types || [];

    const allAggregateInMetricUsers = filterMetricClassroomStudents(users, classroomId, userModes, "attendance");

    const allPastsMeetings = useMemo(() => {
        const now = new Date().getTime();

        // Get past instances directly from the store and add meeting info
        const pastsIntancies: PastInstancieAttendanceT[] = pastInstances
            ?.map(
                (pastInstance) =>
                    ({
                        ...pastInstance,
                        meeting_type: "pastInstance",
                    }) as PastInstancieAttendanceT,
            )
            .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime());

        const pastMeetings: MeetingAttendanceT[] = meetings
            .filter((meeting) => meeting.type !== 8 && new Date(meeting.start_time || 0).getTime() < now)
            .flatMap((meeting) => ({ ...meeting, meeting_type: "meeting" }));

        return [...pastsIntancies, ...pastMeetings]
            .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime())
            .filter((m) => m.is_visible_on_schedule === true) as MeetingAttendanceT[];
    }, [meetings, pastInstances]);

    const meetingsByType = allPastsMeetings.reduce(
        (acc, meeting) => {
            const meetingClassType = meeting.class_type ?? "unknown";
            if (!acc[meetingClassType]) {
                acc[meetingClassType] = [];
            }
            acc[meetingClassType].push(meeting);
            return acc;
        },
        {} as Record<string, MeetingAttendanceT[]>,
    );

    return (
        <>
            <ZoomAttendanceColumns
                allAggregateInMetricUsers={allAggregateInMetricUsers}
                classroomClassTypes={classroomClassTypes}
                meetingsByType={meetingsByType}
            />
        </>
    );
};
