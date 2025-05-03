"use client";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./data-table";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

import { AuthUserWithProfileType, ProfileType, RolesType } from "@/types/auth";
import { Badge } from "../../ui/badge";
import UserSheetData from "./user-sheet-data";
import { AuthUser, UserMetadata } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { cn } from "@/lib/utils";
import { ClassroomType } from "@/types/classrooms";

type ProfilesDataTableProps = {
  users: Partial<AuthUserWithProfileType>[];
  handleCreateNewUser: (
    user: Partial<AuthUser & { password: string }>
  ) => Promise<string | false>;
  handleDeleteUser: (id: string) => Promise<boolean>;
  handleUpdateUser: (
    userID: string,
    user: Partial<AuthUser & { password: string }>
  ) => Promise<boolean>;
  handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  handleUpdateUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  handleDeleteUserRole: (userId: string) => Promise<boolean>;
  excludeRoles?: RolesType[];
  loading: boolean;
  classrooms: ClassroomType[];
}

const ProfilesDataTable = ({
  users,
  handleDeleteUser,
  handleCreateNewUser,
  handleUpdateUser,
  handleAddUserRole,
  handleUpdateUserRole,
  handleDeleteUserRole,
  loading,
  excludeRoles,
  classrooms
}: ProfilesDataTableProps) => {
  const columns: ColumnDef<Partial<AuthUserWithProfileType>>[] = [
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
                .getValue<ProfileType>("profile")
                .full_name.split(" ")
                .filter((word, i) => i < 2)
                .map((word) => word[0].toUpperCase())
                .join("") || "U"}
            </AvatarFallback>
            <AvatarImage
              src={row.getValue<ProfileType>("profile").avatarUrl || ""}
            />
            <div
              className={cn(
                "bg-black/55 rounded-full absolute top-0 right-0 bottom-0 left-0 m-auto hidden group-hover:flex justify-center items-center",
                row.getIsSelected() && "!flex"
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
              className="text-left px-2"
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
            {row.getValue<ProfileType>("profile").full_name}
          </p>
          <p>{row.getValue<ProfileType>("profile").email}</p>
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
    {
      accessorKey: "user_roles",
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        return (
          <div className="flex justify-center align-center w-full">
            <Button
              variant="ghost"
              className="text-center px-2"
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
              .getValue<ProfileType>("profile")
              .user_roles?.map((userRole, i) => (
                <Badge variant="outline" className="!mx-auto" key={i}>
                  {userRole.role}
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
              className="text-left px-2"
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
      accessorKey: "last_sign_in_at",
      header: ({ column }) => {
        const sortState = column.getIsSorted();

        return (
          <div className="w-full flex justify-center items-center">
            <Button
              variant="ghost"
              className="text-left px-2"
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
              Ultimo login em
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
        const lastSingInAt = row.getValue("last_sign_in_at") as string;
        const date = new Date(lastSingInAt);
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
    {
      accessorKey: "user_metadata",
      header: ({ column }) => {
        const sortState = column.getIsSorted();

        return (
          <div className="w-full flex justify-center items-center">
            <Button
              variant="ghost"
              className="text-left px-2"
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
          <Badge variant="outline" className="!m-1 truncate">
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
              className="text-left px-2"
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
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir Menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <UserSheetData
                mode="edit"
                currentUser={user}
                handleAddUserRole={handleAddUserRole}
                handleUpdateUserRole={handleUpdateUserRole}
                handleDeleteUserRole={handleDeleteUserRole}
                handleCreateNewUser={handleCreateNewUser}
                handleUpdateUser={handleUpdateUser}
                excludeRoles={excludeRoles}
              />
              {user.id && (
                <Button
                  variant="ghost"
                  className="!px-2 w-full h-max items-start justify-start text-start"
                  onClick={() => handleDeleteUser(user.id || "")}
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

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      defaultRoleValue="admin"
      handleAddUserRole={handleAddUserRole}
      handleUpdateUserRole={handleUpdateUserRole}
      handleDeleteUserRole={handleDeleteUserRole}
      handleCreateNewUser={handleCreateNewUser}
      handleUpdateUser={handleUpdateUser}
      excludeRoles={excludeRoles}
      classrooms={classrooms}
    />
  );
};

export default ProfilesDataTable;
