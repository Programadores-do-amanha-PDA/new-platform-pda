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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

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
import { AuthUserWithProfileT, ProfileT } from "@/types/auth";
import { ClassroomActivityT } from "@/types/classroom-activities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ActivityTypeSelector from "./activity-type-selector";
import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import { ActivityJustificationDropdown } from "./activity-justification-dropdown";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import InsertManyActivitiesDialog from "./insert-many-activities-dialog";
import { ParticipationStatusOptions } from "../utils/participation-status-options";
import ActivitiesPaginationControl from "./activities-pagination-control";

interface ActivitiesTableProps {
  users: Partial<AuthUserWithProfileT>[];
  activities: ClassroomActivityT[];
}

export const usersColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] = [
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

export default function ActivitiesTable({
  users,
  activities,
}: ActivitiesTableProps) {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [displayedActivitiesCount, setDisplayedActivitiesCount] =
    React.useState(Math.min(activities.length, 10));

  const { updateActivityById, deleteActivity } = useClassroomActivityStore();

  // Update displayed count when activities change
  React.useEffect(() => {
    setDisplayedActivitiesCount(Math.min(activities.length, 10));
  }, [activities.length]);

  // Get the activities to display based on pagination
  const displayedActivities = React.useMemo(() => {
    return activities.slice(0, displayedActivitiesCount);
  }, [activities, displayedActivitiesCount]);

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
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Procurando por alguém?"
          value={(table.getColumn("profile")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("profile")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <InsertManyActivitiesDialog classroomId={classroom_id} />
        <ActivitiesPaginationControl
          totalActivities={activities.length}
          displayedCount={displayedActivitiesCount}
          onCountChange={setDisplayedActivitiesCount}
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
                {displayedActivities.length > 0 &&
                  displayedActivities.map((activity, index) => {
                    return (
                      <TableHead key={index} className="w-full h-max p-0 m-0">
                        <div className="w-full h-full flex flex-col justify-center items-center border-r border-border">
                          <div className="w-full h-11 max-w-[155px] flex justify-between items-center border-b border-border px-2 pl-4">
                            <p className="font-bold text-center">
                              {new Date(activity.created_at).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                }
                              )}
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
                          <div className="w-[155px] h-11 flex justify-center items-center p-2">
                            <ActivityTypeSelector
                              value={activity.class_type}
                              handleValueChange={(value) =>
                                updateActivityById(activity.id, {
                                  class_type: value,
                                })
                              }
                            />
                          </div>
                          {!activity.is_visible_on_schedule && (
                            <div className="w-full px-2 pb-1">
                              <Badge variant="secondary" className="text-xs">
                                Oculta
                              </Badge>
                            </div>
                          )}
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
                  {displayedActivities.length > 0 &&
                    displayedActivities.map((activity, index) => {
                      const userEmail = row.original.email;
                      console.log(userEmail);
                      const hasParticipated =
                        activity.participants_email?.includes(userEmail || "");
                      console.log(activity.participants_email);
                      const hasJustification = activity.justifications?.some(
                        (j) => j.user_email === userEmail
                      );

                      let status: "E" | "F" | "PJ" = "F";
                      if (hasParticipated) {
                        status = "E";
                      } else if (hasJustification) {
                        status = "PJ";
                      }

                      return (
                        <TableCell
                          key={index}
                          className="border-r border-border"
                        >
                          <div className="w-full h-full flex items-center justify-between px-2 gap-1">
                            <div className="w-full h-full flex flex-col justify-center items-start">
                              <p
                                className={cn(
                                  "font-semibold",
                                  ParticipationStatusOptions[status].color
                                )}
                                title={ParticipationStatusOptions[status].label}
                              >
                                {status}
                              </p>
                            </div>
                            {userEmail && (
                              <ActivityJustificationDropdown
                                key={`ActivityJustificationDropdown-${row.id}-${activity.id}`}
                                currentActivity={activity}
                                currentUserEmail={userEmail}
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
