"use client";

import { ColumnDef } from "@tanstack/react-table";
import { GetMeetingsByTypeColumnsP } from "../types/zoom-attendance.types";
import { getAllWeeklyMeetingsGroupedByMonth, getAttendanceAccumulator } from "../utils/kpis-zoom-attendance";

export const ZoomAttendanceColumns = ({
    meetingsByType,
    // allAggregateInMetricUsers,
    classroomClassTypes,
}: GetMeetingsByTypeColumnsP) => {
    const allMeetings = Object.entries(meetingsByType).map(([key, value]) => {
        const currentClassType = classroomClassTypes.find((classType) => classType.id === key);
        const allTypeMeetings = value.sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime());
        const allWeeklyMeetingsGroupedByMonth = getAllWeeklyMeetingsGroupedByMonth({ allMeetings: allTypeMeetings });
        if (!currentClassType || !allTypeMeetings.length || !allWeeklyMeetingsGroupedByMonth.length) return;

        const columns: ColumnDef = [
            {
                accessorKey: "",
                header: "Status",
            },
        ];

        return columns;
    });

    // meetingsByTypeKeys.map((key) => {
    //     const meetings = meetingsByType[key];
    //     const meetingsCount = meetings.length;
    //     const currentClassType = classroomClassTypes.find((classType) => classType.id === key);

    //     if (currentClassType === undefined) return;

    //     // Usa reduce para somar as porcentagens de presença de cada meeting
    //     const attendanceData = getAttendanceAccumulator({
    //         meetings,
    //         allAggregateInMetricUsers,
    //         classroomClassTypes,
    //     });

    //     // Calcula a porcentagem final (média das porcentagens)
    //     const finalAttendancePercentage =
    //         attendanceData.count > 0 ? Math.round(attendanceData.totalPresencePercentage / attendanceData.count) : 0;

    //     return { title: currentClassType.title, totalMeetings: meetingsCount, totalAttendance: finalAttendancePercentage };
    // });

    // return allWeeklyMeetingsGroupedByMonth.map(({ month, weeklyMeetings }) => {
    //     const columns: ColumnDef<>[] = [
    //         {
    //             accessorKey: "status",
    //             header: "Status",
    //         },
    //     ];

    //     return columns;
    // });

    return <></>;
};
