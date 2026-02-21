"use client";

import { useState, useMemo, useCallback } from "react";
import { isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

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
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateIntervalPaginationControl } from "@/components/shared/date-interval";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { calculatePollPercentage } from "../utils/question-percentage-calc";
import { useClassroomSettingStore } from "@/features/classrooms/settings";
import { Profile } from "@/features/users/profile/types/profile";
import { ZoomMeeting } from "@/features/classroom-zoom/types/meetings";
import { ZoomMeetingPastInstance } from "@/features/classroom-zoom/types/past-instances";
import { getFirstLastInitials } from "@/utils";

interface PollResultsTableProps {
    allVisibleUsers: Profile[];
    meetings: (
        | (ZoomMeetingPastInstance & { meeting_type: "meeting" | "pastInstance" })
        | (ZoomMeeting & { meeting_type: "meeting" | "pastInstance" })
    )[];
    classroomId: string;
}

export const usersColumns: ColumnDef<Profile>[] = [
    {
        accessorKey: "profile",
        header: ({ column }) => {
            const sortState = column.getIsSorted();
            return (
                <div className="flex justify-between items-center px-2 border-r border-b w-full h-[141px]">
                    <p className="font-semibold text-left">Usuário</p>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            if (!sortState) {
                                column.toggleSorting(false);
                            } else if (sortState === "asc") {
                                column.toggleSorting(true);
                            } else {
                                column.clearSorting();
                            }
                        }}
                    >
                        {sortState === "asc" ? (
                            <ArrowUp className="stroke-primary-foreground" />
                        ) : sortState === "desc" ? (
                            <ArrowDown className="stroke-primary-foreground" />
                        ) : (
                            <ArrowUpDown />
                        )}
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            const user = row.original as Profile;

            return (
                <div className="flex flex-row justify-start items-center gap-2 bg-background group-hover/row:bg-muted/50! px-2 border-r border-b w-full min-h-[57px]">
                    <Avatar>
                        <AvatarFallback>{getFirstLastInitials(user.full_name) || "US"}</AvatarFallback>
                        <AvatarImage src={user.avatar_url || ""} />
                    </Avatar>
                    <div className="flex flex-col justify-center w-full truncate lowercase">
                        <p className="font-bold text-sm capitalize">{user.full_name}</p>
                        <p>{user.email}</p>
                    </div>
                </div>
            );
        },
        sortingFn: (rowA, rowB) => {
            const nameA = rowA.original?.full_name?.toLowerCase() || "";
            const nameB = rowB.original?.full_name?.toLowerCase() || "";
            return nameA?.localeCompare(nameB);
        },
        filterFn: (row, id, filterValue) => {
            const user = row.getValue(id) as Profile;
            const userEmail = user.email?.toLowerCase() || "";
            const searchTerm = filterValue.toLowerCase();

            return user.full_name.toLowerCase().includes(searchTerm) || userEmail.toLowerCase().includes(searchTerm);
        },
    },
];

export default function PollResultsTable({ allVisibleUsers, meetings, classroomId }: PollResultsTableProps) {
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

    // Create dynamic columns for meetings - grouped poll results with sub-headers
    const meetingColumns: ColumnDef<Profile>[] = useMemo(() => {
        return displayedMeetings.map((meeting, index) => ({
            id: `meeting-${meeting.id}-${index}`,
            header: () => {
                // Calculate percentages for each category
                const contentAnswers =
                    meeting.poll_results?.map((poll) => poll.question_details[0]?.answer.toLowerCase()).filter(Boolean) || [];

                const facilitationAnswers =
                    meeting.poll_results?.map((poll) => poll.question_details[1]?.answer.toLowerCase()).filter(Boolean) || [];
                const selfDevAnswers =
                    meeting.poll_results?.map((poll) => poll.question_details[2]?.answer.toLowerCase()).filter(Boolean) || [];

                const contentPercentage = calculatePollPercentage(contentAnswers);
                const facilitationPercentage = calculatePollPercentage(facilitationAnswers);
                const selfDevPercentage = calculatePollPercentage(selfDevAnswers);

                // Calculate general percentage (average of all three)
                const generalPercentage =
                    contentAnswers.length > 0 || facilitationAnswers.length > 0 || selfDevAnswers.length > 0
                        ? (contentPercentage + facilitationPercentage + selfDevPercentage) / 3
                        : 0;

                return (
                    <div className="flex flex-col p-0! border-r-2 border-b w-[430px] h-[141px]">
                        <div className="flex justify-center items-center px-2 border-b w-full h-11!">
                            <div className="flex justify-center items-center gap-4">
                                <p className="font-bold text-sm">
                                    {new Date(meeting.start_time || 0).getTime() === new Date().getTime()
                                        ? "Hoje"
                                        : new Date(meeting.start_time || 0).toLocaleDateString("pt-BR", {
                                              day: "2-digit",
                                              month: "2-digit",
                                              year: "2-digit",
                                          })}
                                </p>
                                <Badge variant="outline" className="font-medium text-xs">
                                    {classroomClassTypes.find((classType) => classType.id === meeting.class_type)?.title ||
                                        "Tipo não definido"}
                                </Badge>
                            </div>
                        </div>

                        {/* General Percentage Row */}
                        <div className="flex justify-center items-center border-b w-full h-8">
                            <p className="font-bold text-sm">Geral: {generalPercentage.toFixed(1)}%</p>
                        </div>

                        {/* Poll Categories Sub-headers */}
                        <div className="flex border-b w-full h-8">
                            <div className="flex flex-1 justify-center items-center px-1 border-r h-8">
                                <p className="font-semibold text-xs text-center">Conteúdo</p>
                            </div>
                            <div className="flex flex-1 justify-center items-center px-1 border-r h-8">
                                <p className="font-semibold text-xs text-center">Facilitação</p>
                            </div>
                            <div className="flex flex-1 justify-center items-center px-1 h-8">
                                <p className="font-semibold text-xs text-center">Auto-desenvolvimento</p>
                            </div>
                        </div>

                        {/* Individual Percentages Row */}
                        <div className="flex w-full h-8">
                            <div className="flex flex-1 justify-center items-center px-1 border-r h-8">
                                <p className="font-bold text-blue-600 text-xs">{contentPercentage.toFixed(1)}%</p>
                            </div>
                            <div className="flex flex-1 justify-center items-center px-1 border-r h-8">
                                <p className="font-bold text-purple-600 text-xs">{facilitationPercentage.toFixed(1)}%</p>
                            </div>
                            <div className="flex flex-1 justify-center items-center px-1 h-8">
                                <p className="font-bold text-orange-600 text-xs">{selfDevPercentage.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                );
            },
            cell: ({ row }) => {
                const userEmail = row.original.email || "";
                const userPollResults = meeting.poll_results?.find((poll) => poll.email === userEmail);

                if (!userPollResults) {
                    return (
                        <div className="flex border-r-2 border-b w-[430px] min-h-[57px]">
                            <div className="flex flex-1 justify-center items-center px-1 border-r">
                                <span className="text-muted-foreground text-xs">-</span>
                            </div>
                            <div className="flex flex-1 justify-center items-center px-1 border-r">
                                <span className="text-muted-foreground text-xs">-</span>
                            </div>
                            <div className="flex flex-1 justify-center items-center px-1">
                                <span className="text-muted-foreground text-xs">-</span>
                            </div>
                        </div>
                    );
                }

                const contentAnswer = userPollResults.question_details[0]?.answer || "-";
                const facilitationAnswer = userPollResults.question_details[1]?.answer || "-";
                const selfDevAnswer = userPollResults.question_details[2]?.answer || "-";

                return (
                    <div className="flex border-r-2 border-b w-[430px] min-h-[57px]">
                        <div className="flex flex-1 justify-center items-center px-1 py-2 border-r">
                            <span className="text-xs text-center truncate capitalize" title={contentAnswer}>
                                {contentAnswer}
                            </span>
                        </div>
                        <div className="flex flex-1 justify-center items-center px-1 py-2 border-r">
                            <span className="text-xs text-center truncate capitalize" title={facilitationAnswer}>
                                {facilitationAnswer}
                            </span>
                        </div>
                        <div className="flex flex-1 justify-center items-center px-1 py-2">
                            <span className="text-xs text-center truncate capitalize" title={selfDevAnswer}>
                                {selfDevAnswer}
                            </span>
                        </div>
                    </div>
                );
            },
        }));
    }, [classroomClassTypes, displayedMeetings]);

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
                            <TableRow key={headerGroup.id} className="p-0! border-0! max-w-[155px]!">
                                {headerGroup.headers.map((header) => {
                                    const isUserColumn = header.id === "profile";
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                "m-0! p-0! border-0! w-full",
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
