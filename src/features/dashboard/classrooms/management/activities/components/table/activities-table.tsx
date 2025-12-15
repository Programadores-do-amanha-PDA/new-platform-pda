"use client";

import { useCallback, useMemo, useState } from "react";
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
import { isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateIntervalPaginationControl } from "@/components/shared/date-interval";

import { useSettingStore } from "../../../settings";
import { useActivityStore } from "../../store";
import { useActivityColumns } from "../../hooks";
import { ActivitiesTablePropsT } from "../../types";

import { usersColumns } from "./";
import InsertManyActivitiesDialog from "../insert-many-activities-dialog";

export default function ActivitiesTable({
    allVisibleUsers,
    allAggregateInMetricUsers,
    activities,
    classroomId,
}: ActivitiesTablePropsT) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [dateRange, setDateRange] = useState<DateRange | null>(null);

    const { updateActivityById, deleteActivityById } = useActivityStore();
    const { settingsByClassroom } = useSettingStore();

    const currentConfig = settingsByClassroom[classroomId];
    const classroomModules = currentConfig?.modules || [];

    // Get activities to display based on date range filter
    const displayedActivities = useMemo(() => {
        if (!dateRange || !dateRange.from || !dateRange.to) return activities;

        return activities.filter((activity) => {
            const activityDate = new Date(activity.created_at);
            return isWithinInterval(activityDate, {
                start: dateRange.from!,
                end: dateRange.to!,
            });
        });
    }, [activities, dateRange]);

    const handleDateRangeChange = useCallback((newDateRange: DateRange) => {
        setDateRange(newDateRange);
    }, []);

    // Create dynamic columns for activities
    const activityColumns = useActivityColumns({
        displayedActivities,
        allAggregateInMetricUsers,
        updateActivityById,
        deleteActivityById,
    });

    // Combine user columns with activity columns
    const allColumns = useMemo(() => {
        return [...usersColumns, ...activityColumns];
    }, [activityColumns]);

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
                <div className="flex justify-between gap-4">
                    <InsertManyActivitiesDialog classroomId={classroomId} />
                    <DateIntervalPaginationControl onDateRangeChange={handleDateRangeChange} modules={classroomModules} />
                </div>
            </div>
            <div className="flex border rounded-md w-full h-full overflow-y-auto">
                <Table className="w-max">
                    <TableHeader className="top-0 right-0 left-0 z-20 sticky bg-sidebar border-0! overflow-hidden">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="!p-0 border-0! max-w-[155px]! h-max">
                                {headerGroup.headers.map((header) => {
                                    const isUserColumn = header.id === "profile";
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                "!m-0 !p-0 !border-0 w-full h-max",
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
