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
import { ArrowDown, ArrowUp, ArrowUpDown, Pen } from "lucide-react";

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
import { AuthUserWithProfileType, ProfileType } from "@/types/auth";
import { ZoomMeetingPastInstancesType } from "@/types/zoom/meetings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import MeetingTypeSelector from "./meeting-type-selector";
import { useAdminStackContext } from "@/context/admin/stack-context";

interface AttendanceTableProps {
  users: Partial<AuthUserWithProfileType>[];
  meetings: ZoomMeetingPastInstancesType[];
}

const AttendanceStatusOptions = {
  P: { label: "Presente", color: "text-green-500" },
  F: { label: "Falta", color: "text-red-500" },
  PP: { label: "Presença Parcial", color: "text-yellow-500" },
  FJ: { label: "Falta Justificada", color: "text-orange-500" },
};

export const usersColumns: ColumnDef<Partial<AuthUserWithProfileType>>[] = [
  {
    accessorKey: "profile",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-start items-center border-r border-border px-2">
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
      <div className="w-full h-full flex flex-row gap-2 justify-start items-center px-2 border-r border-border bg-background">
        <Avatar>
          <AvatarFallback>
            {row
              .getValue<ProfileType>("profile")
              .full_name.split(" ")
              .filter((word, i) => i < 2)
              .map((word) => word[0].toUpperCase())
              .join("") || "U"}
          </AvatarFallback>
          <AvatarImage
            src={row.getValue<ProfileType>("profile").avatarUrl || ""}
          />
        </Avatar>
        <div className="w-full flex flex-col justify-center lowercase truncate">
          <p className="text-sm font-bold capitalize">
            {row.getValue<ProfileType>("profile").full_name}
          </p>
          <p>{row.getValue<ProfileType>("profile").email}</p>
        </div>
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original?.profile?.full_name?.toLowerCase() || "";
      const nameB = rowB.original?.profile?.full_name?.toLowerCase() || "";
      return nameA?.localeCompare(nameB);
    },
    filterFn: (row, id, filterValue) => {
      const profile = row.getValue(id) as ProfileType;
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

  const {
    classroomsStack: {
      zoom: {
        meetings: { handleUpdateZoomMeetingPastInstance },
      },
    },
  } = useAdminStackContext();

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
    <div className="w-full h-full flex flex-col gap-2 overflow-hidden">
      <div className="flex items-center py-4">
        <Input
          placeholder="Procurando por alguém?"
          value={(table.getColumn("profile")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border flex w-full h-full overflow-y-auto">
        <Table className="w-full h-full">
          <TableHeader className="bg-sidebar sticky top-0 left-0 right-0 z-20 overflow-hidden shadow-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                {meetings.length > 0 &&
                  meetings.map((pastMeeting, index) => {
                    return (
                      <TableHead key={index} className="w-full h-max p-0 m-0">
                        <div className="w-full h-full flex flex-col justify-center items-center border-r border-border">
                          <div className="w-full h-11 flex justify-center items-center border-b border-border p-2">
                            <p className="font-bold">
                              {new Date(pastMeeting.start_time).getTime() ===
                              new Date().getTime()
                                ? "Hoje"
                                : new Date(
                                    pastMeeting.start_time
                                  ).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                  })}
                            </p>
                          </div>
                          <div className="w-full h-11 flex justify-center items-center p-2">
                            <MeetingTypeSelector
                              value={pastMeeting.class_type}
                              handleValueChange={(value) =>
                                pastMeeting.meetingId &&
                                handleUpdateZoomMeetingPastInstance(
                                  pastMeeting.meetingId,
                                  pastMeeting.uuid,
                                  { class_type: value }
                                )
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
                  {meetings.length > 0 &&
                    meetings.map((meeting, index) => {
                      const meetingAttendanceHistory =
                        meeting?.participants?.filter(
                          (p) => p.user_email === row.original.email
                        );

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
                            key={index}
                            className={cn(
                              "border-r border-border",
                              new Date(meeting.start_time).getTime() ===
                                new Date().getTime()
                                ? "bg-amber-50"
                                : ""
                            )}
                          >
                            <div className="w-full h-full flex items-center justify-start px-4 gap-1">
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
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell
                          key={index}
                          className="border-r border-border"
                        >
                          <div className="w-full h-full flex items-center justify-start gap-1 px-4">
                            <p
                              className={cn(
                                "font-semibold",
                                AttendanceStatusOptions["F"].color
                              )}
                              title={AttendanceStatusOptions["F"].label}
                            >
                              F
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {}}
                              className="ml-auto"
                            >
                              <Pen className="size-3 stroke-muted-foreground" />
                            </Button>
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
