"use client";

import { useState, useMemo, useCallback } from "react";
import { isWithinInterval } from "date-fns";
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
import { cn } from "@/lib/utils";

import MeetingTypeSelector from "./meeting-type-selector";
import { AttendanceJustificationDropdown } from "./attendance-justification-dropdown";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";
import { AuthUserWithProfileT, ProfileT, ZoomMeetingT } from "@/types";
import { ZoomMeetingPastInstanceT } from "@/types/classroom-zoom/past-instances";
import { calculateUserAttendance } from "@/utils/attendance-calculator";
import { calculateClassPresence } from "../utils/class-presence";
import { DateRange } from "react-day-picker";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import Color from "color";

interface AttendanceTableProps {
  users: Partial<AuthUserWithProfileT>[];
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
        <div className="w-full h-[133.5px] flex justify-between items-center border-r border-b px-2">
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
      <div className="w-full h-[57px] flex flex-row gap-2 justify-start items-center px-2 border-r border-b bg-background group-hover/row:bg-muted/50!">
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
            src={row.getValue<ProfileT>("profile").avatarUrl || ""}
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

export default function AttendanceTable({
  users,
  meetings,
  classroomId,
}: AttendanceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const { updatePastInstanceByUuid } = useZoomMeetingPastInstanceStore();
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
  const classroomJustifications = useMemo(() => {
    if (currentConfig && currentConfig.justifications.length > 0)
      return currentConfig.justifications;
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
  const meetingColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] =
    useMemo(() => {
      return displayedMeetings.map((meeting, index) => ({
        id: `meeting-${meeting.id}-${index}`,
        header: () => (
          <div className="w-[155px]! h-full flex flex-col justify-center items-center border-r border-b">
            <div className="w-[155px]! h-11 flex justify-center items-center border-b px-2">
              <p className="font-bold">
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
            </div>
            <div className="w-[155px]! h-11 flex justify-center items-center p-2">
              <MeetingTypeSelector
                key={`MeetingTypeSelector-${meeting.id}-${index}`}
                value={meeting.class_type}
                options={classroomClassTypes}
                handleValueChange={(value) =>
                  updatePastInstanceByUuid(meeting.uuid, {
                    class_type: value,
                  })
                }
              />
            </div>
            <div className="w-[155px]! h-11 flex justify-center items-center gap-1 border-t px-2">
              <p>{calculateClassPresence(meeting, users)}%</p>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const currentClassType = classroomClassTypes.find(
            (classType) => classType.id === meeting.class_type
          );
          const userAttendance = calculateUserAttendance(
            meeting,
            row.original.email || "",
            currentClassType!,
            classroomJustifications
          );

          return (
            <div className="w-[155px]! h-[57px] flex items-center justify-between gap-1 px-2 border-b border-r">
              <div className="flex flex-col">
                <p
                  className="font-semibold"
                  style={{
                    color: backgroundColor(
                      userAttendance?.justification?.color ||
                        userAttendance?.limit?.color
                    ),
                  }}
                  title={
                    userAttendance?.justification?.title ||
                    userAttendance?.limit?.title
                  }
                >
                  {userAttendance?.justification?.key ||
                    userAttendance?.limit?.key}
                </p>

                {userAttendance.minutesAttended > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {userAttendance.minutesAttended}M
                  </p>
                )}
              </div>
              {row.original.email &&
                (userAttendance?.justification ||
                  userAttendance?.limit?.allowJustification) && (
                  <AttendanceJustificationDropdown
                    key={`AttendanceJustificationDropdown-${meeting.id}-${index}`}
                    currentMeeting={meeting}
                    currentUserEmail={row.original.email}
                    type={meeting.meeting_type}
                  />
                )}
            </div>
          );
        },
      }));
    }, [
      classroomClassTypes,
      classroomJustifications,
      displayedMeetings,
      users,
    ]);

  // Combine user columns with meeting columns
  const allColumns = useMemo(() => {
    return [...usersColumns, ...meetingColumns];
  }, [meetingColumns]);

  const table = useReactTable({
    data: users,
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
        pageSize: users?.length || 1000,
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
