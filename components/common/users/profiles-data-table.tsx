"use client";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./data-table";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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
}: {
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
}) => {
  const columns: ColumnDef<Partial<AuthUserWithProfileType>>[] = [
    {
      id: "select",
      header: ({ table }) => (
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
      ),
      cell: ({ row }) => (
        <Avatar className="relative group">
          <AvatarFallback>
            {row
              .getValue<ProfileType>("profile")
              .full_name.split(" ")
              .filter((word, i) => i < 2)
              .map((word) => word[0].toUpperCase())
              .join("") || "U"}
          </AvatarFallback>
          <AvatarImage src="/assets/images/avatar.png" />
          <div
            className={cn(
              "bg-primary/15 rounded-full absolute top-0 right-0 bottom-0 left-0 m-auto hidden group-hover:flex justify-center items-center",
              row.getIsSelected() && "!flex"
            )}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value: unknown) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="size-5"
            />
          </div>
        </Avatar>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "profile",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-left px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase truncate">
          {row.getValue<ProfileType>("profile").full_name}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "user_roles",
      header: () => <div className="px-2 text-left">Cargos</div>,

      cell: ({ row }) => {
        return row
          .getValue<ProfileType>("profile")
          .user_roles?.map((userRole, i) => (
            <Badge variant="outline" className="!m-1" key={i}>
              {userRole.role}
            </Badge>
          ));
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-left px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Criado em
            <ArrowUpDown />
          </Button>
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
        return <div className="lowercase">{formattedDate}</div>;
      },
    },
    {
      accessorKey: "last_sign_in_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-left px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ultimo login em
            <ArrowUpDown />
          </Button>
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
          <div className="lowercase">
            {formattedDate !== "NaN/NaN/NaN" ? formattedDate : "--"}
          </div>
        );
      },
    },
    {
      accessorKey: "user_metadata",
      header: () => <div className="px-2 text-left">Email confirmado?</div>,

      cell: ({ row }) => (
        <Badge variant="outline" className="!m-1 truncate">
          {row.getValue<UserMetadata>("user_metadata")?.email_verified === true
            ? "Confirmado"
            : "Não confirmado"}
        </Badge>
      ),
    },
    {
      accessorKey: "email_confirmed_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-left px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email confirmado em
            <ArrowUpDown />
          </Button>
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
          <div className="lowercase">
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
    />
  );
};

export default ProfilesDataTable;
