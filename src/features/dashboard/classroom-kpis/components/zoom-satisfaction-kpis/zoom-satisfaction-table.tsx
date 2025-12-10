"use client";

import { useMemo } from "react";

import { logger } from "@/lib/logger";

import { useZoomMeetingPastInstanceStore, useZoomMeetingStore } from "../../../classroom-zoom/stores";
import { useClassroomConfigStore } from "../../../classroom-configs/stores";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useZoomSatisfactionColumns } from "./zoom-satisfaction-columns";
import { MeetingAttendanceT, PastInstancieAttendanceT } from "../../../classroom-attendance/types";
import { ISatisfactionByTypesGroupedByMonthType } from "../../types";
import { getSatisfactionByWeeklyMeetingsGroupedByMonth } from "../../utils/kpis-zoom-satisfaction.utils";

const log = logger.child({ module: "ZoomAttendanceTable" });

export const KPIsZoomSatisfactionTable = ({ classroomId }: { classroomId: string }) => {
    const { meetings } = useZoomMeetingStore();
    const { pastInstances } = useZoomMeetingPastInstanceStore();
    const { configsByClassroom } = useClassroomConfigStore();

    const classroomClassTypes = useMemo(
        () => configsByClassroom[classroomId]?.class_types || [],
        [configsByClassroom, classroomId],
    );

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

    const meetingsByType = useMemo(() => {
        return allPastsMeetings.reduce(
            (acc, meeting) => {
                const meetingClassType = meeting.class_type;
                if (!meetingClassType) return acc;
                if (!acc[meetingClassType]) {
                    acc[meetingClassType] = [];
                }
                acc[meetingClassType].push(meeting);
                return acc;
            },
            {} as Record<string, MeetingAttendanceT[]>,
        );
    }, [allPastsMeetings]);

    const satisfactionByTypesGroupedByMonth = useMemo((): ISatisfactionByTypesGroupedByMonthType[] => {
        const allMeetings = Object.entries(meetingsByType).filter(([key, value]) => {
            try {
                const allClassTypesId = classroomClassTypes.flatMap((classType) => classType.id);
                if (!allClassTypesId.length) throw new Error("no class types found");

                return value.length > 0 || allClassTypesId.includes(key);
            } catch (error) {
                log.debug({ err: error }, "Error in satisfaction allMeetings:");
                return [];
            }
        });

        if (!allMeetings.length) return [] as ISatisfactionByTypesGroupedByMonthType[];

        const result: ISatisfactionByTypesGroupedByMonthType[] = allMeetings.map(([key, value]) => {
            try {
                if (!value.length || !key) throw new Error("no meetings found");

                const currentClassType = classroomClassTypes.find((classType) => classType.id === key);
                if (!currentClassType) throw new Error("no current classType");

                const satisfactionByWeeklyMeetingsGroupedByMonth = getSatisfactionByWeeklyMeetingsGroupedByMonth({
                    allMeetings: value,
                    classroomClassTypes,
                });
                if (!satisfactionByWeeklyMeetingsGroupedByMonth.length) throw new Error("no weekly meetings found");

                return { classType: currentClassType, satisfaction: satisfactionByWeeklyMeetingsGroupedByMonth };
            } catch (error) {
                log.error({ err: error }, "Error on satisfactionByTypesGroupedByMonth");
                return {} as ISatisfactionByTypesGroupedByMonthType;
            }
        });

        if (!result.length || !result) return [] as ISatisfactionByTypesGroupedByMonthType[];

        return result.filter((item) => item !== null || item !== undefined) || ([] as ISatisfactionByTypesGroupedByMonthType[]);
    }, [meetingsByType, classroomClassTypes]);

    const columns = useZoomSatisfactionColumns({ meetingsByType });

    const table = useReactTable({
        data: satisfactionByTypesGroupedByMonth,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full h-full  overflow-hidden rounded-md border">
            <Table className="w-full h-full">
                <TableHeader className="p-0! m-0! border-none!">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="p-0! m-0! border-none!">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className="p-0! m-0! border-none!">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="h-full w-full p-0! m-0! border-none!">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="p-0! m-0! border-none!"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="p-0! m-0! border-none!">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Sem resultados
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
