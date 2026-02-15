"use client";

import { useState, useMemo, useCallback } from "react";
import { isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

import {
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

import { usersColumns } from "./attendance-table-users-columns";
import { AttendanceTableProps } from "../types";
import { useClassroomSettingStore } from "@/features/classrooms/settings";
import { useAttendanceColumns } from "../hooks/use-attendance-columns";

export default function AttendanceTable({
    allVisibleUsers,
    allAggregateInMetricUsers,
    meetings,
    classroomId,
}: AttendanceTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { settingsByClassroom } = useClassroomSettingStore();

    const currentConfig = useMemo(() => {
        if (settingsByClassroom[classroomId]) return settingsByClassroom[classroomId];
        else return null;
    }, [settingsByClassroom, classroomId]);

    const classroomModules = useMemo(() => {
        if (currentConfig && currentConfig.modules) return currentConfig.modules;
        else return [];
    }, [currentConfig]);

    // Create dynamic columns for meetings using custom hook
    const {meetingColumns, handleDateRangeChange} = useAttendanceColumns({
        allAggregateInMetricUsers,
        currentConfig,
        meetings,
    });

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
                    value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("full_name")?.setFilterValue(event.target.value)}
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
                                    const isUserColumn = header.id === "full_name";
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
                                        const isUserColumn = cell.column.id === "full_name";

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
