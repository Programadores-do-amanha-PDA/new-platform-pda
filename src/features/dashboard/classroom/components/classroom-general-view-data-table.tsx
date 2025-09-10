"use client";
import { useState } from "react";

import { useUsersStore } from "@/stores/modules/users/users-store";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useDeliveryStore } from "@/stores/modules/classrooms/projects/deliveries";
import { useCorrectionStore } from "@/stores/modules/classrooms/projects/corrections";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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

import { cn } from "@/lib/utils";
import { AuthUserWithProfileT, ProfileT } from "@/types/auth";
import { ClassroomProjectT } from "@/types/classroom-projects/project";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";


const projectsShortLabels = {
  mini_project: "MP",
  end_module_project: "PF",
  end_module_english_project: "PE",
};

const ClassroomGeneralViewDataTable = ({
  classroom_id,
}: {
  classroom_id: string;
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { users } = useUsersStore();
  const { projects } = useProjectStore();
  const { deliveries } = useDeliveryStore();
  const { corrections } = useCorrectionStore();

  const classroomProjects = projects.filter(
    (project) => project.classroom_id === classroom_id
  );

  const columns: ColumnDef<Partial<AuthUserWithProfileT>>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center items-center w-11!">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: unknown) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className=" w-11 flex justify-center items-center">
          <Avatar className="relative group">
            <AvatarFallback>
              {row
                .getValue<ProfileT>("profile")
                .full_name.split(" ")
                .filter((word, i) => i < 2)
                .map((word) => word[0].toUpperCase())
                .join("") || "U"}
            </AvatarFallback>
            <AvatarImage
              src={row.getValue<ProfileT>("profile").avatarUrl || ""}
            />
            <div
              className={cn(
                "bg-black/55 rounded-full absolute top-0 right-0 bottom-0 left-0 m-auto hidden group-hover:flex justify-center items-center",
                row.getIsSelected() && "flex!"
              )}
            >
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: unknown) =>
                  row.toggleSelected(!!value)
                }
                aria-label="Select row"
                className="size-5"
              />
            </div>
          </Avatar>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "profile",
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        return (
          <div className="w-full flex justify-start items-center">
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
        <div className="w-full flex flex-col lowercase truncate px-2">
          <p className="text-sm font-bold capitalize">
            {row.getValue<ProfileT>("profile").full_name}
          </p>
          <p>{row.getValue<ProfileT>("profile").email}</p>
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
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        const sortState = column.getIsSorted();

        return (
          <div className="flex items-center justify-center w-full">
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
              Criado em
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
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string;
        const date = new Date(createdAt);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;

        return (
          <div className="flex items-center justify-center w-full">
            {formattedDate}
          </div>
        );
      },
    },
    {
      id: "projects",
      header: () => (
        <div className="flex items-center justify-center w-full font-semibold">
          <p>Projetos</p>
        </div>
      ),
      cell: ({ row }) => {
        const user = row.original;
        const userProjects = classroomProjects
          .filter((project: ClassroomProjectT) => {
            const projectDeliveries = deliveries.filter(
              (delivery) => delivery.project_id === project.id
            );
            return projectDeliveries.some((delivery) =>
              delivery.members.some((member) => member === user.email)
            );
          })
          .sort((a, b) => {
            const aType = a.project_type;
            const bType = b.project_type;
            if (aType === bType) return 0;
            if (aType === "mini_project") return -1;
            if (bType === "mini_project") return 1;
            if (aType === "end_module_project") return -1;
            if (bType === "end_module_project") return 1;
            return 0;
          })
          .sort((a, b) => Number(a.module) - Number(b.module));

        return (
          <div className="flex items-center justify-start w-full">
            {userProjects.length > 0 ? (
              userProjects.map((project: ClassroomProjectT) => {
                const projectCorrections = corrections.filter(
                  (correction) => correction.project_id === project.id
                );
                const notes = projectCorrections
                  .map((correction) => Number(correction.final_note))
                  .filter((note): note is number => !isNaN(note));

                const maxNote = notes.length > 0 ? Math.max(...notes) : 0;

                return (
                  <Badge variant="outline" key={project.id}>
                    {projectsShortLabels[project.project_type].concat(
                      project.module
                    )}
                    : {maxNote}
                  </Badge>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum projeto</p>
            )}
          </div>
        );
      },
    },
  ];

  const classroomUsers = users.filter((user) =>
    user.profile?.classrooms?.some((c) => c.classroom_id === classroom_id)
  );

  const table = useReactTable({
    data: classroomUsers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false,
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: classroomUsers?.length || 1000,
      },
    },
  });

  return (
    <div className="w-full h-full flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Procurando por alguém?"
          value={(table.getColumn("profile")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("profile")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto font-semibold">
              Colunas <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full h-full flex border rounded-lg overflow-hidden">
        <Table className="w-max">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>
    </div>
  );
};

export default ClassroomGeneralViewDataTable;
