"use client";

import { useMemo } from "react";
import { GetAttendanceByWeeklyMeetingsGroupedByMonthResults, GetMeetingsByTypeColumnsP } from "../types/zoom-attendance.types";
import { getAttendanceByWeeklyMeetingsGroupedByMonth } from "../utils/kpis-zoom-attendance";
import { logger } from "@/lib/logger";
import { ColumnDef } from "@tanstack/react-table";
import { DefaultTableHeader } from "@/components/shared/custom-data-table/default-table-header-cell";

const log = logger.child({ name: "KPIs.zoom-attendance-columns" });

export const ZoomAttendanceColumns = ({
    meetingsByType,
    allAggregateInMetricUsers,
    classroomClassTypes,
}: GetMeetingsByTypeColumnsP) => {
    const attendancesByTypesGroupedByMonth = useMemo(() => {
        const allMeetings = Object.entries(meetingsByType).filter(([key, value]) => {
            try {
                const allClassTypesId = classroomClassTypes.flatMap((classType) => classType.id);
                if (!allClassTypesId.length) throw new Error("no class types found");

                return value.length > 0 || allClassTypesId.includes(key);
            } catch (error) {
                log.error({ err: error }, "Error in attendances:");
                return [];
            }
        });

        if (!allMeetings.length) return;

        const result = allMeetings.map(([key, value]) => {
            try {
                if (!value.length || !key) return;

                const currentClassType = classroomClassTypes.find((classType) => classType.id === key);
                if (!currentClassType) return;

                const attendanceByWeeklyMeetingsGroupedByMonth = getAttendanceByWeeklyMeetingsGroupedByMonth({
                    allMeetings: value,
                    allAggregateInMetricUsers,
                    classroomClassTypes,
                });
                if (!attendanceByWeeklyMeetingsGroupedByMonth.length) throw new Error("no weekly meetings found");

                return { classType: currentClassType, attendances: attendanceByWeeklyMeetingsGroupedByMonth };
            } catch (error) {
                log.error({ err: error }, "Error on attendances");
                return null;
            }
        });

        return (
            result.filter((item) => item !== null || item !== undefined) ||
            ([] as GetAttendanceByWeeklyMeetingsGroupedByMonthResults[])
        );
    }, [meetingsByType, allAggregateInMetricUsers, classroomClassTypes]);

    log.debug({ attendancesByTypesGroupedByMonth }, "attendances");

    // const attendancesByTypesGroupedByMonthColumns: ColumnDef<>[] = useMemo(() => {
    //     return attendancesByTypesGroupedByMonth?.map((attendance, index) => ({
    //         id: `kpi-${attendance?.classType.id}`,
    //         header: () => {
    //             return (
    //           <DefaultTableHeader>

    //           </DefaultTableHeader>
    //             );
    //         },
    //         cell: ({ row }) => {
    //             const userEmail = row.original.email;
    //             const shouldAggregateInMetric = allAggregateInMetricUsers.some((user) => user.email === userEmail);

    //             const currentClassType = classroomClassTypes.find((classType) => classType.id === meeting.class_type);

    //             let userAttendance;

    //             if (currentClassType?.presence_calc_type === "byWeeklyMeetings") {
    //                 const weekMeetings = getMeetingsByWeek(meeting, displayedMeetings, classroomClassTypes);

    //                 userAttendance = calculateUserWeeklyAttendance({
    //                     userEmail: userEmail || "",
    //                     currentMeeting: meeting,
    //                     weekMeetings,
    //                     currentClassType,
    //                     availableJustifications: classroomJustifications,
    //                     shouldAggregateInMetric,
    //                 });
    //             } else {
    //                 // Default single meeting calculation
    //                 userAttendance = calculateUserAttendance({
    //                     meeting,
    //                     userEmail: userEmail || "",
    //                     currentClassType: currentClassType!,
    //                     availableJustifications: classroomJustifications,
    //                     shouldAggregateInMetric,
    //                 });
    //             }

    //             return (
    //                 <div className="w-[155px]! h-[57px] flex items-center justify-between gap-1 px-2 border-b border-r">
    //                     <div className="flex flex-col">
    //                         <p
    //                             className="font-semibold"
    //                             style={{
    //                                 color: backgroundColor(
    //                                     userAttendance?.justification?.color || userAttendance?.limit?.color,
    //                                 ),
    //                             }}
    //                             title={userAttendance?.justification?.title || userAttendance?.limit?.title}
    //                         >
    //                             {userAttendance?.justification?.key || userAttendance?.limit?.key}
    //                         </p>

    //                         {userAttendance.minutesAttended > 0 && userAttendance?.limit?.key !== "--" && (
    //                             <p className="text-sm text-muted-foreground">{userAttendance.minutesAttended}M</p>
    //                         )}
    //                     </div>
    //                     {userEmail &&
    //                         userAttendance?.limit?.key !== "--" &&
    //                         (userAttendance?.justification || userAttendance?.limit?.allow_justification) && (
    //                             <AttendanceJustificationDropdown
    //                                 key={`AttendanceJustificationDropdown-${meeting.id}-${index}`}
    //                                 currentMeeting={meeting}
    //                                 currentUserEmail={userEmail}
    //                                 type={meeting.meeting_type}
    //                             />
    //                         )}
    //                 </div>
    //             );
    //         },
    //     }));
    // }, []);
};
