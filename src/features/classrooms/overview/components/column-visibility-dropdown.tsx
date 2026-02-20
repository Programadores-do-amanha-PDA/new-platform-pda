"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Table } from "@tanstack/react-table";

interface ColumnGroup {
  id: string;
  label: string | null;
  colspan: number;
  columns: string[];
  columnHeaders?: { [key: string]: string };
}

interface ColumnVisibilityDropdownProps<TData> {
  table: Table<TData>;
  columnGroups: ColumnGroup[];
}

export function ColumnVisibilityDropdown<TData>({
  table,
  columnGroups,
}: ColumnVisibilityDropdownProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Visualização
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columnGroups.map((group) => {
          if (group.label === null) {
            // Individual column
            const column = table.getColumn(group.columns[0]);
            if (!column?.getCanHide()) return null;

            return (
              <DropdownMenuCheckboxItem
                key={group.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                onSelect={(e) => e.preventDefault()}
              >
                {group.columnHeaders?.[group.columns[0]] || group.id}
              </DropdownMenuCheckboxItem>
            );
          } else {
            // Group of columns
            const groupColumns = group.columns
              .map((colId) => table.getColumn(colId))
              .filter((col) => col?.getCanHide());

            if (groupColumns.length === 0) return null;

            const allVisible = groupColumns.every((col) => col?.getIsVisible());
            const someVisible = groupColumns.some((col) => col?.getIsVisible());

            return (
              <div key={group.id}>
                <DropdownMenuCheckboxItem
                  className="font-semibold"
                  checked={allVisible}
                  onCheckedChange={(value) => {
                    groupColumns.forEach((col) =>
                      col?.toggleVisibility(!!value)
                    );
                  }}
                  onSelect={(e) => e.preventDefault()}
                >
                  {group.label} {someVisible && !allVisible ? "(Parcial)" : ""}
                </DropdownMenuCheckboxItem>
                {groupColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column?.id}
                    className="ml-4 capitalize"
                    checked={column?.getIsVisible()}
                    onCheckedChange={(value) =>
                      column?.toggleVisibility(!!value)
                    }
                    onSelect={(e) => e.preventDefault()}
                  >
                    {group.columnHeaders?.[column?.id || ""] || column?.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            );
          }
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
