"use client";

import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronsLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    DefaultTableColumnCell,
    DefaultTableHeaderCell,
    TableHeaderItemWithCustomItem,
} from "@/components/shared/custom-data-table";
import { GetMeetingsByTypeColumnsP, SatisfactionByClassTypeGroupedByMonth } from "../../../types";
import { extractFirstDayOfWeekByDate, extractMonthNameAndYearByDate, getMonthsAndWeeksInMonthByMeetings } from "../../../utils";

/**
 * Hook that generates column definitions for a satisfaction KPI table with expandable/collapsible months.
 * 
 * @param {GetMeetingsByTypeColumnsP} props - The hook parameters
 * @param {Record<string, Meeting[]>} props.meetingsByType - Meetings grouped by type
 * @param {MeetingType[]} props.meetingsTypes - Available meeting types
 * 
 * @returns {ColumnDef<SatisfactionByClassTypeGroupedByMonth>[]} Array of column definitions including:
 *   - Title column showing class type percentages
 *   - Satisfaction columns with nested month/week breakdown, supporting:
 *     - Monthly aggregated satisfaction metrics
 *     - Weekly satisfaction metrics (collapsible per month)
 *     - Three satisfaction indicators: Content (blue), Facilitation (purple), Self-Development (orange)
 *     - LocalStorage persistence of minimized/expanded month states
 * 
 * @example
 * const columns = useZoomSatisfactionKPIColumns({ 
 *   meetingsByType: { 'online': [...], 'in-person': [...] },
 *   meetingsTypes: [{ id: 1, title: 'Online' }, { id: 2, title: 'In-person' }]
 * });
 */
export const useZoomSatisfactionKPIColumns = ({ meetingsByType, meetingsTypes }: GetMeetingsByTypeColumnsP) => {
    const ZOOM_SATISFACTION_COLUMNS_KEY = "zoom-satisfaction-columns";
    const monthsWithWeeksByMeetings = useMemo(() => {
        const meetings = Object.values(meetingsByType).flat();
        if (!meetings.length) return [];
        return getMonthsAndWeeksInMonthByMeetings({ meetings });
    }, [meetingsByType]);

    const [rowsMinimized, setRowsMinimized] = useState<string[]>(() => {
        if (typeof window === "undefined") {
            return [];
        }

        try {
            const stored = window.localStorage.getItem(ZOOM_SATISFACTION_COLUMNS_KEY);
            return stored ? (JSON.parse(stored) as string[]) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(ZOOM_SATISFACTION_COLUMNS_KEY, JSON.stringify(rowsMinimized));
    }, [rowsMinimized]);

    const handleSetMonthsMinimized = (rowId: string) => {
        setRowsMinimized((prev) => {
            if (prev.includes(rowId)) {
                return prev.filter((id) => id !== rowId);
            }
            return [...prev, rowId];
        });
    };

    return useMemo(() => {
        const classTypeColumns: ColumnDef<SatisfactionByClassTypeGroupedByMonth>[] = [
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
                            className="border-r-2 min-w-60! h-full min-h-[65px]! max-h-[65px] **:font-medium! **:capitalize!"
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

        const satisfactionColumnsByMonth: ColumnDef<SatisfactionByClassTypeGroupedByMonth>[] = [
            {
                accessorKey: "satisfaction",
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
                                        key={`kpi-satisfaction-by-${month.getTime()}`}
                                        className={cn(
                                            "flex flex-col justify-between items-center border-r-2 w-max h-max max-h-24",
                                            isCurrentMonthMinimized && "min-w-[140px]! max-w-[160px]! w-[160px]",
                                            isLastMonth && "border-r-0!",
                                        )}
                                    >
                                        <TableHeaderItemWithCustomItem
                                            className={cn(
                                                "gap-4 border-r-0 font-semibold capitalize",
                                                isCurrentMonthMinimized && "min-w-[140px]! max-w-[160px]! w-full",
                                            )}
                                            customIcon={<ChevronsLeftRight />}
                                            handleIconClick={handleMinimizeCurrentMonth}
                                        >
                                            {extractMonthNameAndYearByDate(month)}
                                        </TableHeaderItemWithCustomItem>
                                        <div className="flex flex-row justify-between items-center *:last:border-r-0! w-full h-max max-h-12">
                                            <DefaultTableHeaderCell
                                                className={cn(
                                                    "justify-center items-center px-2! border-r w-40 h-12",
                                                    isCurrentMonthMinimized && "w-full",
                                                )}
                                            >
                                                {isCurrentMonthMinimized ? "Mensal" : "M"}
                                            </DefaultTableHeaderCell>
                                            {!isCurrentMonthMinimized &&
                                                weeks &&
                                                weeks.map((week) => (
                                                    <DefaultTableHeaderCell
                                                        className="flex justify-center items-center border-r border-dashed w-40 h-12"
                                                        key={`kpi-satisfaction-by-${week.getTime()}`}
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
                    const satisfactions = row.original.satisfaction;
                    if (!satisfactions) return null;

                    const isLastClassType = meetingsTypes.length - 1 === row.index;

                    return (
                        <div className="flex flex-row justify-between items-center border-0 w-max h-full max-h-[65px]">
                            {monthsWithWeeksByMeetings.map(({ month, weeks }) => {
                                const monthSatisfaction = satisfactions.find(
                                    (sat) => sat.month.date.getTime() === month.getTime(),
                                );
                                const isCurrentMonthMinimized = rowsMinimized.includes(month.toISOString());

                                return (
                                    <div
                                        key={`kpi-satisfaction-cell-${month.getTime()}`}
                                        className={cn(
                                            "flex flex-row justify-between items-center border-r-2 border-b w-max h-max",
                                            isCurrentMonthMinimized && "min-w-[140px]! max-w-[160px]! w-[160px]",
                                            isLastClassType && "border-b-0!",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "justify-center p-0! border-r w-40 h-16",
                                                isCurrentMonthMinimized && "min-w-[140px]! max-w-[160px]! w-[160px] border-r-0",
                                                isLastClassType && "border-r-0!",
                                            )}
                                        >
                                            <div className="flex flex-col justify-center items-center w-full h-full">
                                                {monthSatisfaction?.month.satisfaction ? (
                                                    <>
                                                        {/* General Percentage Row */}
                                                        <div className="flex justify-center items-center border-b w-full h-8">
                                                            <p className="font-bold text-xs">
                                                                {monthSatisfaction.month.satisfaction.totalSatisfaction?.toFixed(
                                                                    1,
                                                                ) || 0}
                                                                %
                                                            </p>
                                                        </div>
                                                        {/* Individual Percentages Row */}
                                                        <div className="flex w-full h-8">
                                                            <div
                                                                className="flex flex-1 justify-center items-center px-1 border-r w-full h-8"
                                                                title="Conteúdo"
                                                            >
                                                                <p className="text-blue-600 text-xs">
                                                                    {monthSatisfaction.month.satisfaction.indicators?.totalContent?.toFixed(
                                                                        1,
                                                                    ) || 0}
                                                                    %
                                                                </p>
                                                            </div>
                                                            <div
                                                                className="flex flex-1 justify-center items-center px-1 border-r w-full h-8"
                                                                title="Facilitação"
                                                            >
                                                                <p className="text-purple-600 text-xs">
                                                                    {monthSatisfaction.month.satisfaction.indicators?.totalFacilitation?.toFixed(
                                                                        1,
                                                                    ) || 0}
                                                                    %
                                                                </p>
                                                            </div>
                                                            <div
                                                                className="flex flex-1 justify-center items-center px-1 h-8"
                                                                title="Auto-desenvolvimento"
                                                            >
                                                                <p className="text-orange-600 text-xs text-center">
                                                                    {monthSatisfaction.month.satisfaction.indicators?.totalSelfDev?.toFixed(
                                                                        1,
                                                                    ) || 0}
                                                                    %
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p>-</p>
                                                )}
                                            </div>
                                        </div>
                                        {!isCurrentMonthMinimized &&
                                            weeks &&
                                            weeks.map((week, weekIndex) => {
                                                const weekSatisfaction = monthSatisfaction?.weeks.find(
                                                    (w) => w.date.getTime() === week.getTime(),
                                                );
                                                const isLastWeek = weeks.length - 1 === weekIndex;

                                                return (
                                                    <div key={`kpi-satisfaction-cell-week-${week.getTime()}`}>
                                                        <div
                                                            className={cn(
                                                                "border-r border-dashed w-40 h-16",
                                                                isLastWeek && "border-r-0!",
                                                            )}
                                                        >
                                                            <div className="flex flex-col justify-center items-center w-full h-full">
                                                                {weekSatisfaction?.satisfaction ? (
                                                                    <>
                                                                        {/* General Percentage Row */}
                                                                        <div className="flex justify-center items-center border-b w-full h-8">
                                                                            <p className="font-bold text-xs">
                                                                                {weekSatisfaction.satisfaction.totalSatisfaction?.toFixed(
                                                                                    1,
                                                                                ) || 0}
                                                                                %
                                                                            </p>
                                                                        </div>
                                                                        {/* Individual Percentages Row */}
                                                                        <div className="flex w-full h-8">
                                                                            <div
                                                                                className="flex flex-1 justify-center items-center px-1 border-r w-full h-8"
                                                                                title="Conteúdo"
                                                                            >
                                                                                <p className="text-blue-600 text-xs">
                                                                                    {weekSatisfaction.satisfaction.indicators?.totalContent?.toFixed(
                                                                                        1,
                                                                                    ) || 0}
                                                                                    %
                                                                                </p>
                                                                            </div>
                                                                            <div
                                                                                className="flex flex-1 justify-center items-center px-1 border-r w-full h-8"
                                                                                title="Facilitação"
                                                                            >
                                                                                <p className="text-purple-600 text-xs">
                                                                                    {weekSatisfaction.satisfaction.indicators?.totalFacilitation?.toFixed(
                                                                                        1,
                                                                                    ) || 0}
                                                                                    %
                                                                                </p>
                                                                            </div>
                                                                            <div
                                                                                className="flex flex-1 justify-center items-center px-1 h-8"
                                                                                title="Auto-desenvolvimento"
                                                                            >
                                                                                <p className="text-orange-600 text-xs text-center">
                                                                                    {weekSatisfaction.satisfaction.indicators?.totalSelfDev?.toFixed(
                                                                                        1,
                                                                                    ) || 0}
                                                                                    %
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p>-</p>
                                                                )}
                                                            </div>
                                                        </div>
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

        return [...classTypeColumns, ...satisfactionColumnsByMonth];
    }, [monthsWithWeeksByMeetings, meetingsTypes, rowsMinimized]);
};
