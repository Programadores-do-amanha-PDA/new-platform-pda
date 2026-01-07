"use client";

import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
    DefaultTableColumnCell,
    DefaultTableHeaderCell,
    TableHeaderItemWithCustomItem,
} from "@/components/shared/custom-data-table";
import { AttendancesByTypesGroupedByMonthTypes, GetMeetingsByTypeColumnsP } from "../../types";
import { extractFirstDayOfWeekByDate, extractMonthNameAndYearByDate, getMonthsAndWeeksInMonthByMeetings } from "../../utils";
import { cn } from "@/lib/utils";
import { ChevronsLeftRight } from "lucide-react";

export const useZoomAttendanceColumns = ({ meetingsByType, meetingsTypes }: GetMeetingsByTypeColumnsP) => {
    const LOCAL_STORAGE_KEY = "zoom-attendance-columns";

    const monthsWithWeeksByMeetings = useMemo(() => {
        const meetings = Object.values(meetingsByType).flat();
        if (!meetings.length) return [];
        return getMonthsAndWeeksInMonthByMeetings({ meetings });
    }, [meetingsByType]);

    const [rowsMinimized, setRowsMinimized] = useState<string[]>(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rowsMinimized));
    }, [rowsMinimized])

    const handleSetMonthsMinimized = (rowId: string) => {
        setRowsMinimized((prev) => {
            if (prev.includes(rowId)) {
                return prev.filter((id) => id !== rowId);
            }
            return [...prev, rowId];
        });
    };

    return useMemo(() => {
        const classTypeColumns: ColumnDef<AttendancesByTypesGroupedByMonthTypes>[] = [
            {
                accessorKey: "title",
                header: ({ column }) => {
                    return (
                        <DefaultTableHeaderCell
                            column={column}
                            className="bg-sidebar border-r-2 border-b-2 w-full min-w-60! h-24! max-h-24!"
                        >
                            Aulas
                        </DefaultTableHeaderCell>
                    );
                },
                cell: ({ row }) => {
                    const isLastClassType = meetingsTypes.length - 1 === row.index;

                    return (
                        <DefaultTableColumnCell
                            className="border-r-2 w-full min-w-60! **:font-medium! **:capitalize!"
                            isLastElementOnVertical={isLastClassType}
                        >
                            % {row.original.classType?.title}
                        </DefaultTableColumnCell>
                    );
                },
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
                        <div className="top-0 z-10 sticky flex flex-row justify-between items-center bg-sidebar border-b-2 w-max h-max max-h-24">
                            {monthsWithWeeksByMeetings.map(({ month, weeks }) => {
                                const isLastMonth = month.getTime() === monthsWithWeeksByMeetings.at(-1)!.month.getTime();
                                const isCurrentMonthMinimized = rowsMinimized.includes(month.toISOString());
                                const handleMinimizeCurrentMonth = () => {
                                    handleSetMonthsMinimized(month.toISOString());
                                };

                                return (
                                    <div
                                        key={`kpi-attendance-by-${month.getTime()}`}
                                        className={cn(
                                            "flex flex-col justify-between items-center border-r-2 w-max h-max max-h-24",
                                            isCurrentMonthMinimized && "min-w-[105px]! max-w-[120px]! w-full",
                                            isLastMonth && "border-r-0!",
                                        )}
                                    >
                                        <TableHeaderItemWithCustomItem
                                            className={cn(
                                                "gap-4 border-r-0 font-semibold capitalize",
                                                isCurrentMonthMinimized && "min-w-[105px]! max-w-[120px]! w-full",
                                            )}
                                            customIcon={<ChevronsLeftRight />}
                                            handleIconClick={handleMinimizeCurrentMonth}
                                        >
                                            {extractMonthNameAndYearByDate(month)}
                                        </TableHeaderItemWithCustomItem>
                                        <div className="flex flex-row justify-between items-center *:last:border-r-0! w-full h-max max-h-12">
                                            <DefaultTableHeaderCell
                                                className={cn(
                                                    "justify-center items-center px-2! border-r size-12",
                                                    isCurrentMonthMinimized && "w-full justify-start",
                                                )}
                                            >
                                                {isCurrentMonthMinimized ? "Mensal" : "M"}
                                            </DefaultTableHeaderCell>
                                            {!isCurrentMonthMinimized &&
                                                weeks &&
                                                weeks.map((week) => (
                                                    <DefaultTableHeaderCell
                                                        className="flex justify-center items-center border-r border-dashed size-12"
                                                        key={`kpi-attendance-by-${week.getTime()}`}
                                                    >
                                                        {extractFirstDayOfWeekByDate(week)}
                                                    </DefaultTableHeaderCell>
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

                    const isLastClassType = meetingsTypes.length - 1 === row.index;

                    return (
                        <div className="flex flex-row justify-between items-center border-0 w-max h-max">
                            {monthsWithWeeksByMeetings.map(({ month, weeks }) => {
                                const monthAttendance = attendances.find((att) => att.month.date.getTime() === month.getTime());
                                const isCurrentMonthMinimized = rowsMinimized.includes(month.toISOString());

                                return (
                                    <div
                                        key={`kpi-attendance-cell-${month.getTime()}`}
                                        className={cn(
                                            "flex flex-row justify-between items-center border-r-2 last:border-r-0! *:last:border-r-0! w-max h-max",
                                            isCurrentMonthMinimized && "min-w-[105px]! max-w-[120px]! w-[120px]",
                                        )}
                                    >
                                        <DefaultTableColumnCell
                                            className={cn(
                                                "justify-center border-r size-12",
                                                isCurrentMonthMinimized && "min-w-[105px]! max-w-[120px]! w-[120px]",
                                            )}
                                            isLastElementOnVertical={isLastClassType}
                                        >
                                            {monthAttendance?.month.attendance !== null &&
                                            monthAttendance?.month.attendance !== undefined
                                                ? `${monthAttendance.month.attendance.totalPresencePercentage.toFixed(0)}%`
                                                : "-"}
                                        </DefaultTableColumnCell>
                                        {!isCurrentMonthMinimized &&
                                            weeks &&
                                            weeks.map((week, weekIndex) => {
                                                const weekAttendance = monthAttendance?.weeks.find(
                                                    (w) => w.date.getTime() === week.getTime(),
                                                );
                                                const isLastWeek = weeks.length - 1 === weekIndex;

                                                return (
                                                    <div
                                                        key={`kpi-attendance-cell-week-${week.getTime()}`}
                                                        className={cn("border-b", isLastClassType && "border-b-0!")}
                                                    >
                                                        <DefaultTableColumnCell
                                                            className="border-b-0! border-dashed size-12"
                                                            isLastElementOnHorizontal={isLastWeek}
                                                        >
                                                            {weekAttendance?.attendance !== null &&
                                                            weekAttendance?.attendance !== undefined
                                                                ? `${weekAttendance.attendance.totalPresencePercentage.toFixed(0)}%`
                                                                : "-"}
                                                        </DefaultTableColumnCell>
                                                    </div>
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
    }, [monthsWithWeeksByMeetings, meetingsTypes, rowsMinimized]);
};
