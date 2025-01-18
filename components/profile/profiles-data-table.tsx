"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEffect, useState } from "react";
import EditProfileSheetData from "./edit-profile-sheet-data";

import { Profiles } from "@/types/auth";
import axios from "axios";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<Profiles>[] = [
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
    accessorKey: "full_name",
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
      <div className="lowercase">{row.getValue("full_name")}</div>
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
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "user_roles",
    header: () => <div className="px-2 text-left">Cargos</div>,

    cell: ({ row }) => {
      return row
        .getValue("user_roles")
        ?.map((userRole) => <Badge variant="outline">{userRole.role}</Badge>);
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const profile = row.original;
      console.log(profile);

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
            <EditProfileSheetData profile={profile} />
            <DropdownMenuItem>Deletar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const ProfilesDataTable = () => {
  const [profiles, setProfiles] = useState<Profiles[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/profiles");
        setProfiles(response.data.results);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchProfiles();
  }, []);

  return <DataTable columns={columns} data={profiles} loading={loading} />;
};

export default ProfilesDataTable;
