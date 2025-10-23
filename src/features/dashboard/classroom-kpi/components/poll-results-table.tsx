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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateIntervalPaginationControl } from "@/components/shared/date-interval";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";

import { AuthUserWithProfileT, ProfileT } from "@/types";
import {
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "../../classroom-zoom/types";
import { calculatePollPercentage } from "../utils/question-percentage-calc";

interface PollResultsTableProps {
  allVisibleUsers: Partial<AuthUserWithProfileT>[];
  meetings: (
    | (ZoomMeetingPastInstanceT & { meeting_type: "meeting" | "pastInstance" })
    | (ZoomMeetingT & { meeting_type: "meeting" | "pastInstance" })
  )[];
  classroomId: string;
}

export const usersColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] = [
  {
    accessorKey: "profile",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-[141px] flex justify-between items-center border-r border-b px-2">
          <p className="text-left font-semibold">Usuário</p>
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
    cell: ({ row }) => (
      <div className="w-full min-h-[57px] flex flex-row gap-2 justify-start items-center px-2 border-r border-b bg-background group-hover/row:bg-muted/50!">
        <Avatar>
          <AvatarFallback>
            {row
              .getValue<ProfileT>("profile")
              .full_name.split(" ")
              .filter((_, i) => i < 2)
              .map((word) => word[0].toUpperCase())
              .join("") || "U"}
          </AvatarFallback>
          <AvatarImage
            src={row.getValue<ProfileT>("profile").avatar_url || ""}
          />
        </Avatar>
        <div className="w-full flex flex-col justify-center lowercase truncate">
          <p className="text-sm font-bold capitalize">
            {row.getValue<ProfileT>("profile").full_name}
          </p>
          <p>{row.getValue<ProfileT>("profile").email}</p>
        </div>
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original?.profile?.full_name?.toLowerCase() || "";
      const nameB = rowB.original?.profile?.full_name?.toLowerCase() || "";
      return nameA?.localeCompare(nameB);
    },
    filterFn: (row, id, filterValue) => {
      const profile = row.getValue(id) as ProfileT;
      const searchTerm = filterValue.toLowerCase();

      return (
        profile.full_name.toLowerCase().includes(searchTerm) ||
        profile.email.toLowerCase().includes(searchTerm)
      );
    },
  },
];

export default function PollResultsTable({
  allVisibleUsers,
  meetings,
  classroomId,
}: PollResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const { configsByClassroom } = useClassroomConfigStore();

  const currentConfig = useMemo(() => {
    if (configsByClassroom[classroomId]) return configsByClassroom[classroomId];
    else return null;
  }, [configsByClassroom, classroomId]);
  const classroomModules = useMemo(() => {
    if (currentConfig && currentConfig.modules) return currentConfig.modules;
    else return [];
  }, [currentConfig]);
  const classroomClassTypes = useMemo(() => {
    if (currentConfig && currentConfig.class_types.length > 0)
      return currentConfig.class_types;
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
  const meetingColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] =
    useMemo(() => {
      return displayedMeetings.map((meeting, index) => ({
        id: `meeting-${meeting.id}-${index}`,
        header: () => {
          // Calculate percentages for each category
          const contentAnswers =
            meeting.poll_results
              ?.map((poll) => poll.question_details[0]?.answer.toLowerCase())
              .filter(Boolean) || [];

          console.log(calculatePollPercentage(contentAnswers));

          const facilitationAnswers =
            meeting.poll_results
              ?.map((poll) => poll.question_details[1]?.answer.toLowerCase())
              .filter(Boolean) || [];
          const selfDevAnswers =
            meeting.poll_results
              ?.map((poll) => poll.question_details[2]?.answer.toLowerCase())
              .filter(Boolean) || [];

          const contentPercentage = calculatePollPercentage(contentAnswers);
          const facilitationPercentage =
            calculatePollPercentage(facilitationAnswers);
          const selfDevPercentage = calculatePollPercentage(selfDevAnswers);

          // Calculate general percentage (average of all three)
          const generalPercentage =
            contentAnswers.length > 0 ||
            facilitationAnswers.length > 0 ||
            selfDevAnswers.length > 0
              ? (contentPercentage +
                  facilitationPercentage +
                  selfDevPercentage) /
                3
              : 0;

          return (
            <div className="w-[430px] h-[141px] p-0! flex flex-col border-r-2 border-b">
              <div className="w-full h-11! flex justify-center items-center border-b px-2">
                <div className="flex justify-center items-center gap-4">
                  <p className="font-bold text-sm">
                    {new Date(meeting.start_time || 0).getTime() ===
                    new Date().getTime()
                      ? "Hoje"
                      : new Date(meeting.start_time || 0).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          }
                        )}
                  </p>
                  <Badge variant="outline" className="text-xs font-medium">
                    {classroomClassTypes.find(
                      (classType) => classType.id === meeting.class_type
                    )?.title || "Tipo não definido"}
                  </Badge>
                </div>
              </div>

              {/* General Percentage Row */}
              <div className="w-full h-8 flex justify-center items-center border-b">
                <p className="text-sm font-bold">
                  Geral: {generalPercentage.toFixed(1)}%
                </p>
              </div>

              {/* Poll Categories Sub-headers */}
              <div className="w-full h-8 flex border-b">
                <div className="flex-1 h-8 flex justify-center items-center border-r px-1">
                  <p className="text-xs font-semibold text-center">Conteúdo</p>
                </div>
                <div className="flex-1 h-8 flex justify-center items-center border-r px-1">
                  <p className="text-xs font-semibold text-center">
                    Facilitação
                  </p>
                </div>
                <div className="flex-1 h-8 flex justify-center items-center px-1">
                  <p className="text-xs font-semibold text-center">
                    Auto-desenvolvimento
                  </p>
                </div>
              </div>

              {/* Individual Percentages Row */}
              <div className="w-full h-8 flex">
                <div className="flex-1 h-8 flex justify-center items-center border-r px-1">
                  <p className="text-xs font-bold text-blue-600">
                    {contentPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="flex-1 h-8 flex justify-center items-center border-r px-1">
                  <p className="text-xs font-bold text-purple-600">
                    {facilitationPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="flex-1 h-8 flex justify-center items-center px-1">
                  <p className="text-xs font-bold text-orange-600">
                    {selfDevPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          );
        },
        cell: ({ row }) => {
          const userEmail = row.original.email || "";
          const userPollResults = meeting.poll_results?.find(
            (poll) => poll.email === userEmail
          );

          if (!userPollResults) {
            return (
              <div className="w-[430px] min-h-[57px] flex border-b border-r-2">
                <div className="flex-1 flex justify-center items-center border-r px-1">
                  <span className="text-xs text-muted-foreground">-</span>
                </div>
                <div className="flex-1 flex justify-center items-center border-r px-1">
                  <span className="text-xs text-muted-foreground">-</span>
                </div>
                <div className="flex-1 flex justify-center items-center px-1">
                  <span className="text-xs text-muted-foreground">-</span>
                </div>
              </div>
            );
          }

          const contentAnswer =
            userPollResults.question_details[0]?.answer || "-";
          const facilitationAnswer =
            userPollResults.question_details[1]?.answer || "-";
          const selfDevAnswer =
            userPollResults.question_details[2]?.answer || "-";

          return (
            <div className="w-[430px] min-h-[57px] flex border-b border-r-2">
              <div className="flex-1 flex justify-center items-center border-r px-1 py-2">
                <span
                  className="text-xs text-center capitalize truncate"
                  title={contentAnswer}
                >
                  {contentAnswer}
                </span>
              </div>
              <div className="flex-1 flex justify-center  items-center border-r px-1 py-2">
                <span
                  className="text-xs text-center capitalize truncate"
                  title={facilitationAnswer}
                >
                  {facilitationAnswer}
                </span>
              </div>
              <div className="flex-1 flex justify-center items-center px-1 py-2">
                <span
                  className="text-xs text-center capitalize truncate"
                  title={selfDevAnswer}
                >
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
        <DateIntervalPaginationControl
          onDateRangeChange={handleDateRangeChange}
          modules={classroomModules}
        />
      </div>

      <div className="rounded-md border flex w-full h-full overflow-y-auto">
        <Table className="w-max">
          <TableHeader className="bg-sidebar border-0! sticky top-0 left-0 right-0 z-20 overflow-hidden">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="max-w-[155px]! border-0! !p-0"
              >
                {headerGroup.headers.map((header) => {
                  const isUserColumn = header.id === "profile";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "w-full !p-0 !m-0 !border-0",
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
