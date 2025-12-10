"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
    DefaultTableColumnCell,
    DefaultTableHeaderCell,
    TableHeaderItemWithCustomItem,
} from "@/components/shared/custom-data-table";

import { GetMeetingsByTypeColumnsP, ISatisfactionByTypesGroupedByMonthType } from "../../types";
import { extractFirstDayOfWeekByDate, extractMonthNameAndYearByDate, getMonthsAndWeeksInMonthByMeetings } from "../../utils";

export const useZoomSatisfactionColumns = ({ meetingsByType }: GetMeetingsByTypeColumnsP) => {
    const monthsWithWeeksByMeetings = useMemo(() => {
        const meetings = Object.values(meetingsByType).flat();
        if (!meetings.length) return [];
        return getMonthsAndWeeksInMonthByMeetings({ meetings });
    }, [meetingsByType]);

    return useMemo(() => {
        const classTypeColumns: ColumnDef<ISatisfactionByTypesGroupedByMonthType>[] = [
            {
                accessorKey: "title",
                header: ({ column }) => {
                    return (
                        <DefaultTableHeaderCell column={column} className="max-h-24! h-24! border-r-2">
                            Indices
                        </DefaultTableHeaderCell>
                    );
                },
                cell: ({ row }) => (
                    <DefaultTableColumnCell className="**:capitalize! **:font-medium! border-r-2 h-[64px]">
                        % {row.original.classType?.title}
                    </DefaultTableColumnCell>
                ),
                sortingFn: (rowA, rowB) => {
                    const titleA = rowA.original.classType?.title.toLowerCase() || "";
                    const titleB = rowB.original.classType?.title?.toLowerCase() || "";
                    return titleA?.localeCompare(titleB);
                },
            },
        ];

        const satisfactionColumnsByMonth: ColumnDef<ISatisfactionByTypesGroupedByMonthType>[] = [
            {
                accessorKey: "satisfaction",
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
                                            <DefaultTableHeaderCell className="border-r-2 h-[64px] w-40 items-center justify-center">
                                                M
                                            </DefaultTableHeaderCell>
                                            {weeks.map((week) => (
                                                <DefaultTableHeaderCell
                                                    className="border-r h-[64px] w-40 flex items-center justify-center"
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
                    const satisfactions = row.original.satisfaction;
                    if (!satisfactions) return null;

                    return (
                        <div className="w-max h-[64px] flex flex-row justify-between items-center">
                            {monthsWithWeeksByMeetings.map(({ month, weeks }) => {
                                const monthSatisfaction = satisfactions.find(
                                    (sat) => sat.month.date.getTime() === month.getTime(),
                                );

                                return (
                                    <div
                                        key={`kpi-attendance-cell-${month.getTime()}`}
                                        className="w-max h-max flex flex-row justify-center items-center border-r-2"
                                    >
                                        <div className="border-r-2 h-[64px] w-40 p-0! border-b flex flex-col items-center justify-center">
                                            {monthSatisfaction?.month.satisfaction ? (
                                                <>
                                                    {/* General Percentage Row */}
                                                    <div className="w-full h-8 flex justify-center items-center border-b">
                                                        <p className="text-sm font-bold">
                                                            {monthSatisfaction.month.satisfaction.totalSatisfaction?.toFixed(
                                                                1,
                                                            ) || 0}
                                                            %
                                                        </p>
                                                    </div>
                                                    {/* Poll Categories Sub-headers */}

                                                    {/* Individual Percentages Row */}
                                                    <div className="w-full h-8 flex">
                                                        <div
                                                            className="flex-1 w-full h-8 flex justify-center items-center border-r px-1"
                                                            title="Conteúdo"
                                                        >
                                                            <p className="text-xs font-bold text-blue-600">
                                                                {monthSatisfaction.month.satisfaction.indicators?.totalContent?.toFixed(
                                                                    1,
                                                                ) || 0}
                                                                %
                                                            </p>
                                                        </div>
                                                        <div
                                                            className="flex-1 w-full h-8 flex justify-center items-center border-r px-1"
                                                            title="Facilitação"
                                                        >
                                                            <p className="text-xs font-bold text-purple-600">
                                                                {monthSatisfaction.month.satisfaction.indicators?.totalFacilitation?.toFixed(
                                                                    1,
                                                                ) || 0}
                                                                %
                                                            </p>
                                                        </div>
                                                        <div
                                                            className="flex-1 h-8 flex justify-center items-center px-1"
                                                            title="Auto-desenvolvimento"
                                                        >
                                                            <p className="text-xs font-bold text-orange-600 text-center">
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
                                        {weeks.map((week) => {
                                            const weekSatisfaction = monthSatisfaction?.weeks.find(
                                                (w) => w.date.getTime() === week.getTime(),
                                            );
                                            return (
                                                <div
                                                    className="border-r h-[64px] w-40 p-0! border-b flex flex-col items-center justify-center"
                                                    key={`kpi-attendance-cell-week-${week.getTime()}`}
                                                >
                                                    {weekSatisfaction?.satisfaction ? (
                                                        <>
                                                            {/* General Percentage Row */}
                                                            <div className="w-full h-8 flex justify-center items-center border-b">
                                                                <p className="text-sm font-bold">
                                                                    {weekSatisfaction.satisfaction.totalSatisfaction?.toFixed(
                                                                        1,
                                                                    ) || 0}
                                                                    %
                                                                </p>
                                                            </div>
                                                            {/* Poll Categories Sub-headers */}

                                                            {/* Individual Percentages Row */}
                                                            <div className="w-full h-8 flex">
                                                                <div
                                                                    className="flex-1 w-full h-8 flex justify-center items-center border-r px-1"
                                                                    title="Conteúdo"
                                                                >
                                                                    <p className="text-xs font-bold text-blue-600">
                                                                        {weekSatisfaction.satisfaction.indicators?.totalContent?.toFixed(
                                                                            1,
                                                                        ) || 0}
                                                                        %
                                                                    </p>
                                                                </div>
                                                                <div
                                                                    className="flex-1 w-full h-8 flex justify-center items-center border-r px-1"
                                                                    title="Facilitação"
                                                                >
                                                                    <p className="text-xs font-bold text-purple-600">
                                                                        {weekSatisfaction.satisfaction.indicators?.totalFacilitation?.toFixed(
                                                                            1,
                                                                        ) || 0}
                                                                        %
                                                                    </p>
                                                                </div>
                                                                <div
                                                                    className="flex-1 h-8 flex justify-center items-center px-1"
                                                                    title="Auto-desenvolvimento"
                                                                >
                                                                    <p className="text-xs font-bold text-orange-600 text-center">
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
    }, [monthsWithWeeksByMeetings]);
};
