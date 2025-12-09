"use client";

import { useMemo } from "react";
import { AttendancesByTypesGroupedByMonthTypes, GetMeetingsByTypeColumnsP } from "../../types/zoom-attendance.types";
import {
    extractFirstDayOfWeekByDate,
    extractMonthNameAndYearByDate,
    getMonthsAndWeeksInMonthByMeetings,
} from "../../utils/kpis-zoom-attendance";
import { ColumnDef } from "@tanstack/react-table";
import { DefaultTableHeader } from "@/components/shared/custom-data-table/default-table-header-cell";
import { DefaultRowCell } from "@/components/shared/custom-data-table/default-column-cell";
import { TableHeaderItemWithCustomItem } from "@/components/shared/custom-data-table/custom-table-header-cell";

export const useZoomAttendanceColumns = ({ meetingsByType }: GetMeetingsByTypeColumnsP) => {
    const monthsWithWeeksByMeetings = useMemo(() => {
        const meetings = Object.values(meetingsByType).flat();
        if (!meetings.length) return [];
        return getMonthsAndWeeksInMonthByMeetings({ meetings });
    }, [meetingsByType]);

    return useMemo(() => {
        const classTypeColumns: ColumnDef<AttendancesByTypesGroupedByMonthTypes>[] = [
            {
                accessorKey: "title",
                header: ({ column }) => {
                    return (
                        <DefaultTableHeader column={column} className="max-h-24! h-24! border-r-2">
                            Indices
                        </DefaultTableHeader>
                    );
                },
                cell: ({ row }) => (
                    <DefaultRowCell className="**:capitalize! **:font-medium! border-r-2">
                        % {row.original.classType?.title}
                    </DefaultRowCell>
                ),
                sortingFn: (rowA, rowB) => {
                    const titleA = rowA.original.classType?.title.toLowerCase() || "";
                    const titleB = rowB.original.classType?.title?.toLowerCase() || "";
                    return titleA?.localeCompare(titleB);
                },
            },
        ];

        const attendanceColumnsByMonth: ColumnDef<AttendancesByTypesGroupedByMonthTypes>[] = [
            {
                accessorKey: "attendances",
                header: () => {
                    return (
                        <div className="w-max h-max max-h-24 flex flex-row justify-between items-center border-b">
                            {monthsWithWeeksByMeetings.map(({ month, weeks }) => {
                                return (
                                    <div
                                        key={`kpi-attendance-by-${month.getTime()}`}
                                        className="w-max h-max max-h-24 flex flex-col justify-between items-center border-r-2"
                                    >
                                        <TableHeaderItemWithCustomItem className="capitalize font-semibold border-r-0">
                                            {extractMonthNameAndYearByDate(month)}
                                        </TableHeaderItemWithCustomItem>
                                        <div className="w-full h-max max-h-12 flex flex-row justify-between items-center *:last:border-r-0!">
                                            <DefaultTableHeader className="border-r size-12 items-center justify-center">
                                                M
                                            </DefaultTableHeader>
                                            {weeks.map((week) => (
                                                <DefaultTableHeader
                                                    className="border-r size-12 flex items-center justify-center"
                                                    key={`kpi-attendance-by-${week.getTime()}`}
                                                >
                                                    {extractFirstDayOfWeekByDate(week)}
                                                </DefaultTableHeader>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                },
                cell: ({ row }) => {
                    const attendances = row.original.attendances;
                    if (!attendances) return null;

                    return (
                        <div className="w-max h-max flex flex-row justify-between items-center">
                            {monthsWithWeeksByMeetings.map(({ month, weeks }) => {
                                const monthAttendance = attendances.find((att) => att.month.date.getTime() === month.getTime());

                                return (
                                    <div
                                        key={`kpi-attendance-cell-${month.getTime()}`}
                                        className="w-max h-max flex flex-row justify-between items-center border-r-2 *:last:border-r-0!"
                                    >
                                        <DefaultRowCell className="border-r size-12">
                                            {monthAttendance?.month.attendance !== null &&
                                            monthAttendance?.month.attendance !== undefined
                                                ? `${monthAttendance.month.attendance.totalPresencePercentage.toFixed(0)}%`
                                                : "-"}
                                        </DefaultRowCell>
                                        {weeks.map((week) => {
                                            const weekAttendance = monthAttendance?.weeks.find(
                                                (w) => w.date.getTime() === week.getTime(),
                                            );
                                            return (
                                                <DefaultRowCell
                                                    className="border-r size-12"
                                                    key={`kpi-attendance-cell-week-${week.getTime()}`}
                                                >
                                                    {weekAttendance?.attendance !== null &&
                                                    weekAttendance?.attendance !== undefined
                                                        ? `${weekAttendance.attendance.totalPresencePercentage.toFixed(0)}%`
                                                        : "-"}
                                                </DefaultRowCell>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                },
            },
        ];

        return [...classTypeColumns, ...attendanceColumnsByMonth];
    }, [monthsWithWeeksByMeetings]);
};
