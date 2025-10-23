"use client";

// Global imports
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

// UI Imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Local Imports
import { AuthUserWithProfileT, ProfileT } from "@/types";

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
            src={row.getValue<ProfileT>("profile").avatar_url || ""}
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
