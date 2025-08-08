"use client";

import * as React from "react";
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
import { AuthUserWithProfileT, ProfileT } from "@/types/auth";
import { ZoomMeetingPastInstanceT } from "@/types/classroom-zoom/past-instances";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import MeetingTypeSelector from "./meeting-type-selector";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";
import { AttendanceJustificationDropdown } from "./attendance-justification-dropdown";
import { ZoomMeetingT } from "@/types/classroom-zoom";
import AttendancePaginationControl from "./attendance-pagination-control";

interface AttendanceTableProps {
  users: Partial<AuthUserWithProfileT>[];
  meetings: (
    | (ZoomMeetingPastInstanceT & { meeting_type: "meeting" | "pastInstance" })
    | (ZoomMeetingT & { meeting_type: "meeting" | "pastInstance" })
  )[];
}

const AttendanceStatusOptions = {
  P: { label: "Presente", color: "text-green-500" },
  F: { label: "Falta", color: "text-red-500" },
  PP: { label: "Presença Parcial", color: "text-yellow-500" },
  FJ: { label: "Falta Justificada", color: "text-orange-500" },
};

export const usersColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] = [
  {
    accessorKey: "profile",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-start items-center border-r border-b border-border px-2">
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
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
            Usuário
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary" />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex flex-row gap-2 justify-start items-center px-2 border-r bg-background">
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
}: AttendanceTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [displayedMeetingsCount, setDisplayedMeetingsCount] =
    React.useState(31);

  const { updatePastInstanceByUuid } = useZoomMeetingPastInstanceStore();

  const displayedMeetings = React.useMemo(() => {
    return meetings.slice(0, displayedMeetingsCount);
  }, [meetings, displayedMeetingsCount]);

  const table = useReactTable({
    data: users,
    columns: usersColumns,
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
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Procurando por alguém?"
          value={(table.getColumn("profile")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <AttendancePaginationControl
          totalMeetings={meetings.length}
          displayedCount={displayedMeetingsCount}
          onCountChange={setDisplayedMeetingsCount}
        />
      </div>
      <div className="rounded-md border flex w-full h-full overflow-y-auto">
        <Table className="w-max h-full">
          <TableHeader className="bg-sidebar sticky top-0 left-0 right-0 z-20 overflow-hidden">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="!p-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="w-full h-max sticky left-0 bg-sidebar z-10 p-0"
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
                {displayedMeetings.length > 0 &&
                  displayedMeetings.map((pastMeeting, index) => {
                    return (
                      <TableHead
                        key={`TableHead-${pastMeeting.id}-${index}`}
                        className="w-full h-max !p-0 !m-0 !border-0"
                      >
                        <div className="w-full h-full flex flex-col justify-center items-center border-r border-b">
                          <div className="w-full h-11 flex justify-center items-center border-b border-border px-2">
                            <p className="font-bold">
                              {new Date(
                                pastMeeting.start_time || 0
                              ).getTime() === new Date().getTime()
                                ? "Hoje"
                                : new Date(
                                    pastMeeting.start_time || 0
                                  ).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                  })}
                            </p>
                          </div>
                          <div className="w-[155px]! h-11 flex justify-center items-center p-2">
                            <MeetingTypeSelector
                              key={`MeetingTypeSelector-${pastMeeting.id}-${index}`}
                              value={pastMeeting.class_type}
                              handleValueChange={(value) =>
                                updatePastInstanceByUuid(pastMeeting.uuid, {
                                  class_type: value,
                                })
                              }
                            />
                          </div>
                        </div>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="p-0 h-full sticky left-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}

                  {displayedMeetings.length > 0 &&
                    displayedMeetings.map((meeting, index) => {
                      const meetingAttendanceHistory =
                        meeting?.participants?.filter(
                          (p) => p.user_email === row.original.email
                        );

                      const meetingJustification =
                        meeting?.justifications?.find(
                          (j) => j.user_email === row.original.email
                        );
                      if (meetingJustification) {
                        return (
                          <TableCell
                            key={`TableCell-${meeting.id}-${index}`}
                            className="border-r border-border"
                          >
                            <div className="w-[155px]! h-full flex items-center justify-between gap-1 px-2">
                              <p
                                className={cn(
                                  "font-semibold",
                                  AttendanceStatusOptions["FJ"].color
                                )}
                                title={AttendanceStatusOptions["FJ"].label}
                              >
                                FJ
                              </p>
                              {row.original.email && (
                                <AttendanceJustificationDropdown
                                  key={`AttendanceJustificationDropdown-${meeting.id}-${index}`}
                                  currentMeeting={meeting}
                                  currentUserEmail={row.original.email}
                                  type={meeting.meeting_type}
                                />
                              )}
                            </div>
                          </TableCell>
                        );
                      }

                      if (
                        meetingAttendanceHistory &&
                        meetingAttendanceHistory.length > 0
                      ) {
                        const attendanceMinutes = Math.round(
                          meetingAttendanceHistory.reduce(
                            (accumulator, currentValue) =>
                              accumulator + currentValue.duration,
                            0
                          ) / 60
                        );

                        return (
                          <TableCell
                            key={`TableCell-${meeting.id}-${index}`}
                            className={cn(
                              "border-r border-border",
                              new Date(meeting.start_time || 0).getTime() ===
                                new Date().getTime()
                                ? "bg-amber-50"
                                : ""
                            )}
                          >
                            <div className="w-full h-full flex items-start justify-between px-2 gap-1">
                              <div className="w-full h-full flex flex-col justify-center items-start">
                                {attendanceMinutes >= 60 ? (
                                  <p
                                    className={cn(
                                      "font-semibold",
                                      AttendanceStatusOptions["P"].color
                                    )}
                                    title={AttendanceStatusOptions["P"].label}
                                  >
                                    P
                                  </p>
                                ) : attendanceMinutes >= 30 ? (
                                  <p
                                    className={cn(
                                      "font-semibold",
                                      AttendanceStatusOptions["PP"].color
                                    )}
                                    title={AttendanceStatusOptions["PP"].label}
                                  >
                                    PP
                                  </p>
                                ) : (
                                  <p
                                    className={cn(
                                      "font-semibold",
                                      AttendanceStatusOptions["F"].color
                                    )}
                                    title={AttendanceStatusOptions["F"].label}
                                  >
                                    F
                                  </p>
                                )}

                                {attendanceMinutes < 60 && (
                                  <p className="text-sm text-muted-foreground">
                                    {attendanceMinutes}M
                                  </p>
                                )}
                              </div>
                              {row.original.email && (
                                <AttendanceJustificationDropdown
                                  key={`AttendanceJustificationDropdown-${meeting.id}-${index}`}
                                  currentMeeting={meeting}
                                  currentUserEmail={row.original.email}
                                  type={meeting.meeting_type}
                                />
                              )}
                            </div>
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell
                          key={`TableCell-${meeting.id}-${index}`}
                          className="border-r border-border"
                        >
                          <div className="w-[155px]! h-full flex items-center justify-between gap-1 px-2">
                            <p
                              className={cn(
                                "font-semibold",
                                AttendanceStatusOptions["F"].color
                              )}
                              title={AttendanceStatusOptions["F"].label}
                            >
                              F
                            </p>
                            {row.original.email && (
                              <AttendanceJustificationDropdown
                                key={`AttendanceJustificationDropdown-${meeting.id}-${index}`}
                                currentMeeting={meeting}
                                currentUserEmail={row.original.email}
                                type={meeting.meeting_type}
                              />
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={usersColumns.length}
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
