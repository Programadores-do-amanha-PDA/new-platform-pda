"use client";

import { useCallback, useMemo, useState } from "react";
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
import { MoreHorizontal, Trash2 } from "lucide-react";
import { isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateIntervalPaginationControl } from "@/components/shared/date-interval";

import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import ActivityTypeSelector from "./activity-type-selector";
import { ActivityJustificationDropdown } from "./activity-justification-dropdown";
import InsertManyActivitiesDialog from "./insert-many-activities-dialog";
import { AuthUserWithProfileT } from "@/types";
import { calculateActivityDelivery } from "../utils/activity-delivery-calculator";
import { calculateUserActivityParticipation } from "@/utils/activity-calculator";
import { useClassroomConfigStore } from "@/features/dashboard/classroom-configs/stores";
import { ActivitiesTablePropsT } from "../types";
import { usersColumns } from "./activities-table-columns";

export default function ActivitiesTable({
  allVisibleUsers,
  allAggregateInMetricUsers,
  activities,
  classroomId,
}: ActivitiesTablePropsT) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const { updateActivityById, deleteActivity } = useClassroomActivityStore();
  const { configsByClassroom } = useClassroomConfigStore();

  const currentConfig = configsByClassroom[classroomId];
  const classroomModules = currentConfig?.modules || [];

  // Get the activities to display based on date range filter
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
  const activityColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] =
    useMemo(() => {
      return displayedActivities.map((activity, index) => ({
        id: `activity-${activity.id}-${index}`,
        header: () => (
          <div className="w-[155px]! h-full flex flex-col justify-center items-center border-r border-b">
            <div className="w-[155px]! h-11 flex justify-between items-center border-b border-border px-2 pl-4">
              <p className="font-bold text-center">
                {new Date(activity.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => deleteActivity(activity.id)}
                    className="cursor-pointer"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Deletar atividade
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="w-[155px]! h-11 flex justify-center items-center p-2">
              <ActivityTypeSelector
                key={`ActivityTypeSelector-${activity.id}-${index}`}
                value={activity.class_type}
                handleValueChange={(value) =>
                  updateActivityById(activity.id, {
                    class_type: value,
                  })
                }
              />
            </div>
            <div className="w-[155px]! h-11 flex justify-center items-center gap-1 border-t px-2">
              <p>
                {calculateActivityDelivery(activity, allAggregateInMetricUsers)}
                %
              </p>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const userEmail = row.original.email;
          const shouldAggregateInMetric = allAggregateInMetricUsers.some(
            (user) => user.email === userEmail
          );

          const participationResult = calculateUserActivityParticipation(
            activity,
            userEmail || "",
            shouldAggregateInMetric
          );

          return (
            <div className="w-[155px]! h-[57px] flex items-center justify-between gap-1 px-2 border-b border-r border-border">
              <div className="flex flex-col">
                <p
                  className={cn("font-semibold", participationResult.color)}
                  title={participationResult.label}
                >
                  {participationResult.status}
                </p>
              </div>
              {participationResult.allowJustification && userEmail && (
                <ActivityJustificationDropdown
                  key={`ActivityJustificationDropdown-${activity.id}-${index}`}
                  currentActivity={activity}
                  currentUserEmail={userEmail}
                />
              )}
            </div>
          );
        },
      }));
    }, [
      displayedActivities,
      updateActivityById,
      deleteActivity,
      allAggregateInMetricUsers,
    ]);

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
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Procurando por alguém?"
          value={(table.getColumn("profile")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("profile")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-4 justify-between">
          <InsertManyActivitiesDialog classroomId={classroomId} />
          <DateIntervalPaginationControl
            onDateRangeChange={handleDateRangeChange}
            modules={classroomModules}
          />
        </div>
      </div>
      <div className="rounded-md border flex w-full h-full overflow-y-auto">
        <Table className="w-max">
          <TableHeader className="bg-sidebar border-0! sticky top-0 left-0 right-0 z-20 overflow-hidden">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="max-w-[155px]! border-0! !p-0 h-max"
              >
                {headerGroup.headers.map((header) => {
                  const isUserColumn = header.id === "profile";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "w-full h-max !p-0 !m-0 !border-0",
                        isUserColumn && "sticky left-0 bg-sidebar z-10"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                  className="group/row max-w-[155px]! w-full border-0!"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isUserColumn = cell.column.id === "profile";

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "w-max p-0 h-full border-0!",
                          isUserColumn && "sticky left-0"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
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
