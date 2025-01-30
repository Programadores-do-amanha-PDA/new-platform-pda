"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEffect, useState } from "react";

import { AuthUserWithProfileType, ProfileType } from "@/types/auth";
import axios from "axios";
import { Badge } from "../ui/badge";
import UserSheetData from "./user-sheet-data";
import { UserMetadata } from "@supabase/supabase-js";
import { toast } from "sonner";

const ProfilesDataTable = () => {
  const [users, setUsers] = useState<AuthUserWithProfileType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/users");
        if (response.status !== 200) throw "no GET /api/users response";
        setUsers(response.data.results);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchProfiles();
  }, []);

  const handleUpdateUser = (
    userID: string | undefined,
    userUpdated: AuthUserWithProfileType
  ) => {
    console.log("userUpdated", userUpdated);
    setUsers((users) =>
      users.map((user) => (user.id === userID ? { ...userUpdated } : user))
    );
  };

  const handleInsertNewUser = (newUser: AuthUserWithProfileType) => {
    console.log("handleInsertNewUser", newUser);
    const isUserExist = users.map((user) => user.id).includes(newUser.id);
    if (!isUserExist) {
      setUsers((users) => [...users, newUser]);
    }
  };

  const handleDeleteUser = async (userId: string | undefined) => {
    try {
      if (!userId) throw "user id is required to delete";

      const isUserExist = users.map((user) => user.id).includes(userId);
      const response = await axios.delete(`/api/auth_users?id=${userId}`);
      if (response.status !== 200) throw "no DELETE /api/auth_users response";

      if (isUserExist) {
        setUsers((users) => users.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar usuário. tente novamente mais tarde!");
    }
  };

  const columns: ColumnDef<AuthUserWithProfileType>[] = [
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
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: unknown) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
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
        const user: AuthUserWithProfileType = row.original;
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
                onInsertNewUser={handleInsertNewUser}
                onUpdateUser={handleUpdateUser}
              />
              {user.id && (
                <Button
                  variant="ghost"
                  className="!px-2 w-full h-max items-start justify-start text-start"
                  onClick={() => handleDeleteUser(user.id)}
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
      onInsertNewUser={handleInsertNewUser}
      onUpdateUser={handleUpdateUser}
    />
  );
};

export default ProfilesDataTable;
