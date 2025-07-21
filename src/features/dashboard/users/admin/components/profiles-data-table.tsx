"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AuthUserWithProfileT, ProfileT, RolesT } from "@/types/auth";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";

import { UserMetadata } from "@supabase/supabase-js";
import { DataTable } from "../../components/data-table";
import { useClassroomStore } from "@/stores/modules/classrooms";
import { useUsersStore } from "@/stores/modules/users/users-store";
import InsertManyUsersDialog from "../../components/insert-many-users-dialog";
import UserSheetData from "../../components/user-sheet-data";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";

type ProfilesDataTableProps = {
  excludeRoles?: RolesT[];
  defaultRoleValue?: RolesT;
  loading: boolean;
};

const ProfilesDataTable = ({
  loading,
  excludeRoles,
}: ProfilesDataTableProps) => {
  const { classrooms } = useClassroomStore();
  const { users, deleteUser } = useUsersStore();

  const columns: ColumnDef<Partial<AuthUserWithProfileT>>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="w-full flex justify-center items-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: unknown) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="mx-2"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-full flex justify-center items-center">
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
        <div className="w-full flex flex-col lowercase truncate">
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
      accessorKey: "user_roles",
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        return (
          <div className="flex justify-center align-center w-full">
            <Button
              variant="ghost"
              className="text-center px-2 font-semibold"
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
              Cargo
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
        return (
          <div className="flex justify-center align-center w-full">
            {row
              .getValue<ProfileT>("profile")
              .user_roles?.map((userRole, i) => (
                <Badge variant="outline" className="mx-auto!" key={i}>
                  {rolesLabelsOptions.find(
                    (role) => role.value === userRole.role
                  )?.label || userRole.role}
                </Badge>
              ))}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const rolesA = rowA.original?.profile?.user_roles || [];
        const rolesB = rowB.original?.profile?.user_roles || [];

        const rolesStrA = rolesA
          .map((r) => r.role)
          .sort()
          .join(",");
        const rolesStrB = rolesB
          .map((r) => r.role)
          .sort()
          .join(",");

        return rolesStrA.localeCompare(rolesStrB);
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
      accessorKey: "user_metadata",
      header: ({ column }) => {
        const sortState = column.getIsSorted();

        return (
          <div className="w-full flex justify-center items-center">
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
              Email confirmado?
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
        <div className="w-full flex justify-center items-center">
          <Badge variant="outline" className="m-1! truncate">
            {row.getValue<UserMetadata>("user_metadata")?.email_verified ===
            true
              ? "Confirmado"
              : "Não confirmado"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "email_confirmed_at",
      header: ({ column }) => {
        const sortState = column.getIsSorted();

        return (
          <div className="w-full flex justify-center items-center">
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
              Email confirmado em
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
        const emailConfirmedAt = row.getValue("email_confirmed_at") as string;
        const date = new Date(emailConfirmedAt);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
        return (
          <div className="w-full flex justify-center items-center lowercase">
            {formattedDate !== "NaN/NaN/NaN" ? formattedDate : "--"}
          </div>
        );
      },
    },
  ];

  const actionsColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] = [
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir Menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-bold">Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <UserSheetData
                mode="edit"
                currentUser={user}
                excludeRoles={excludeRoles}
              />
              {user.id && (
                <Button
                  variant="ghost"
                  className="cursor-pointer px-2! w-full h-max items-start justify-start text-start"
                  onClick={() => deleteUser(user.id || "")}
                >
                  Deletar
                </Button>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const classroomColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] =
    classrooms && classrooms.length > 0
      ? [
          {
            id: "classrooms",
            header: ({ column }) => {
              const sortState = column.getIsSorted();
              return (
                <div className="flex justify-center align-center w-full">
                  <Button
                    variant="ghost"
                    className="text-center px-2 font-semibold"
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
                    Turmas
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
              const { profile } = row.original;
              return (
                <div className="flex justify-center align-center w-full">
                  {profile?.classrooms?.map((classroom, i) => (
                    <Badge
                      variant="outline"
                      className="mx-auto!"
                      key={`${i}-${classroom}`}
                    >
                      {classrooms?.find((c) => c.id === classroom.classroom_id)
                        ?.name || ""}
                    </Badge>
                  ))}
                </div>
              );
            },
            sortingFn: (rowA, rowB) => {
              const classroomsA = rowA.original?.profile?.classrooms || [
                { classroom_id: "" },
              ];
              const classroomsB = rowB.original?.profile?.classrooms || [
                { classroom_id: "" },
              ];

              const classroomsStrA = classroomsA
                .map(
                  (c) =>
                    classrooms?.find((cr) => cr.id === c.classroom_id)?.name
                )
                .sort()
                .join(",");
              const classroomsStrB = classroomsB
                .map(
                  (c) =>
                    classrooms?.find((cr) => cr.id === c.classroom_id)?.name
                )
                .sort()
                .join(",");

              return classroomsStrA.localeCompare(classroomsStrB);
            },
          },
        ]
      : [];

  const headerOptions = (
    <div className="flex gap-4">
      <InsertManyUsersDialog
        excludeRoles={excludeRoles}
        classrooms={classrooms}
      />

      <UserSheetData mode="new" excludeRoles={excludeRoles} />
    </div>
  );

  const allColumns = [...columns, ...classroomColumns, ...actionsColumns];

  return (
    <DataTable
      columns={allColumns}
      data={users}
      loading={loading}
      headerRightOptions={headerOptions}
    />
  );
};

export default ProfilesDataTable;
