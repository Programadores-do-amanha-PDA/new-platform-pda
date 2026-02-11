"use client";

import { useState, useMemo, useCallback } from "react";
import { isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";
import Color from "color";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { DateIntervalPaginationControl } from "@/components/shared/date-interval";
import { cn } from "@/lib/utils";

import MeetingTypeSelector from "./meeting-type-selector";
import { AttendanceJustificationDropdown } from "./attendance-justification-dropdown";
import { usersColumns } from "./attendance-table-users-columns";
import { calculateClassPresence, calculateUserAttendance } from "../utils";
import { calculateUserWeeklyAttendance, getMeetingsByWeek } from "../utils/weekly-attendance-calcs";
import { AttendanceTableProps } from "../types";
import { useClassroomSettingStore } from "@/features/classrooms/settings";
import { Profile } from "@/features/users/profile/types/profile";

export default function AttendanceTable({
    allVisibleUsers,
    allAggregateInMetricUsers,
    meetings,
    classroomId,
}: AttendanceTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [dateRange, setDateRange] = useState<DateRange | null>(null);

    const { settingsByClassroom } = useClassroomSettingStore();

    const currentConfig = useMemo(() => {
        if (settingsByClassroom[classroomId]) return settingsByClassroom[classroomId];
        else return null;
    }, [settingsByClassroom, classroomId]);

    const classroomModules = useMemo(() => {
        if (currentConfig && currentConfig.modules) return currentConfig.modules;
        else return [];
    }, [currentConfig]);

    const classroomClassTypes = useMemo(() => {
        if (currentConfig && currentConfig.class_types.length > 0) return currentConfig.class_types;
        else return [];
    }, [currentConfig]);

    const classroomJustifications = useMemo(() => {
        if (currentConfig && currentConfig.justifications.length > 0) return currentConfig.justifications;
        else return [];
    }, [currentConfig]);

    const displayedMeetings = useMemo(() => {
        if (!dateRange || !dateRange.from || !dateRange.to) return meetings;

        return meetings.filter((meeting) => {
            const meetingDate = new Date(meeting.start_time || 0);
            return isWithinInterval(meetingDate, {
                start: dateRange.from!,
                end: dateRange.to!,
            });
        });
    }, [meetings, dateRange]);

    const handleDateRangeChange = useCallback((newDateRange: DateRange) => {
        setDateRange(newDateRange);
    }, []);

    const backgroundColor = (color: string | null | undefined) => {
        try {
            if (!color) throw "color null";
            return Color(color).hex();
        } catch {
            return "#f3f4f6";
        }
    };

    // Create dynamic columns for meetings
    const meetingColumns: ColumnDef<Profile>[] = useMemo(() => {
        return displayedMeetings.map((meeting, index) => ({
            id: `meeting-${meeting.id}-${index}`,
            header: () => {
                return (
                    <div className="flex flex-col justify-center items-center border-r border-b w-[155px]! h-full">
                        <div className="flex justify-center items-center px-2 border-b w-[155px]! h-11">
                            <p className="font-bold">
                                {new Date(meeting.start_time || 0).getTime() === new Date().getTime()
                                    ? "Hoje"
                                    : new Date(meeting.start_time || 0).toLocaleDateString("pt-BR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "2-digit",
                                      })}
                            </p>
                        </div>
                        <div className="flex justify-center items-center p-2 w-[155px]! h-11">
                            <MeetingTypeSelector
                                key={`MeetingTypeSelector-${meeting.id}-${index}`}
                                meeting={meeting}
                                options={classroomClassTypes}
                            />
                        </div>
                        <div className="flex justify-center items-center gap-1 px-2 border-t w-[155px]! h-11">
                            <p>{calculateClassPresence(meeting, allAggregateInMetricUsers)}%</p>
                        </div>
                    </div>
                );
            },
            cell: ({ row }) => {
                const userEmail = row.original.email;
                const shouldAggregateInMetric = allAggregateInMetricUsers.some((user) => user.email === userEmail);

                const currentClassType = classroomClassTypes.find((classType) => classType.id === meeting.class_type);

                let userAttendance;

                if (currentClassType?.presence_calc_type === "byWeeklyMeetings") {
                    const weekMeetings = getMeetingsByWeek(meeting, displayedMeetings, classroomClassTypes);

                    userAttendance = calculateUserWeeklyAttendance({
                        userEmail: userEmail || "",
                        currentMeeting: meeting,
                        weekMeetings,
                        currentClassType,
                        availableJustifications: classroomJustifications,
                        shouldAggregateInMetric,
                    });
                } else {
                    // Default single meeting calculation
                    userAttendance = calculateUserAttendance({
                        meeting,
                        userEmail: userEmail || "",
                        currentClassType: currentClassType!,
                        availableJustifications: classroomJustifications,
                        shouldAggregateInMetric,
                    });
                }

                return (
                    <div className="flex justify-between items-center gap-1 px-2 border-r border-b w-[155px]! h-[57px]">
                        <div className="flex flex-col">
                            <p
                                className="font-semibold"
                                style={{
                                    color: backgroundColor(
                                        userAttendance?.justification?.color || userAttendance?.limit?.color,
                                    ),
                                }}
                                title={userAttendance?.justification?.title || userAttendance?.limit?.title}
                            >
                                {userAttendance?.justification?.key || userAttendance?.limit?.key}
                            </p>

                            {userAttendance.minutesAttended > 0 && userAttendance?.limit?.key !== "--" && (
                                <p className="text-muted-foreground text-sm">{userAttendance.minutesAttended}M</p>
                            )}
                        </div>
                        {userEmail &&
                            userAttendance?.limit?.key !== "--" &&
                            (userAttendance?.justification || userAttendance?.limit?.allow_justification) && (
                                <AttendanceJustificationDropdown
                                    key={`AttendanceJustificationDropdown-${meeting.id}-${index}`}
                                    currentMeeting={meeting}
                                    currentUserEmail={userEmail}
                                    type={meeting.meeting_type}
                                />
                            )}
                    </div>
                );
            },
        }));
    }, [classroomClassTypes, classroomJustifications, displayedMeetings, allAggregateInMetricUsers]);

    // Combine user columns with meeting columns
    const allColumns = useMemo(() => {
        return [...usersColumns, ...meetingColumns];
    }, [meetingColumns]);

    const table = useReactTable({
        data: allVisibleUsers,
        columns: allColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        manualPagination: false,
        autoResetPageIndex: false,
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: allVisibleUsers?.length || 1000,
            },
        },
    });

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Procurando por alguém?"
                    value={(table.getColumn("profile")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("profile")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <DateIntervalPaginationControl onDateRangeChange={handleDateRangeChange} modules={classroomModules} />
            </div>

            <div className="flex border rounded-md w-full h-full overflow-y-auto">
                <Table className="w-max">
                    <TableHeader className="top-0 right-0 left-0 z-20 sticky bg-sidebar border-0! overflow-hidden">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="p-0! border-0! max-w-[155px]! h-max">
                                {headerGroup.headers.map((header) => {
                                    const isUserColumn = header.id === "profile";
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                "m-0! p-0! border-0! w-full h-max",
                                                isUserColumn && "sticky left-0 bg-sidebar z-10",
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="group/row border-0! w-full max-w-[155px]!"
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const isUserColumn = cell.column.id === "profile";

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={cn("p-0 border-0! w-max h-full", isUserColumn && "sticky left-0")}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={allColumns.length} className="h-24 text-center">
                                    Sem resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
