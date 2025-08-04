"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  StudentOverview,
  ClassroomOverviewData,
} from "@/types/classroom-overview";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatPercentage = (value: number) => `${value}%`;
const formatGrade = (value: number) => value.toFixed(1);

export const createColumns = (
  data: ClassroomOverviewData
): ColumnDef<StudentOverview>[] => {
  const baseColumns: ColumnDef<StudentOverview>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p className="font-semibold">Usuário</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex flex-row gap-2 justify-start items-center p-2 border-r border-b bg-background min-w-[250px]">
          <Avatar>
            <AvatarFallback>
              {row
                .getValue<string>("name")
                .split(" ")
                .filter((_, i) => i < 2)
                .map((word) => word[0].toUpperCase())
                .join("") || "U"}
            </AvatarFallback>
            <AvatarImage src="" />
          </Avatar>
          <div className="w-full flex flex-col justify-center lowercase truncate">
            <p className="text-sm font-bold capitalize">
              {row.getValue("name")}
            </p>
            <p>{row.original.email}</p>
          </div>
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const nameA = rowA.original?.name?.toLowerCase() || "";
        const nameB = rowB.original?.name?.toLowerCase() || "";
        return nameA?.localeCompare(nameB);
      },
      filterFn: (row, _, filterValue) => {
        const name = row.getValue("name") as string;
        const email = row.original.email;
        const searchTerm = filterValue.toLowerCase();

        return (
          name.toLowerCase().includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm)
        );
      },
    },
    {
      accessorKey: "presence.general",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Presença Geral</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-center items-center p-2 border-r border-b min-w-[120px]">
          <span className="font-medium">
            {formatPercentage(row.original.presence.general)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "presence.programming",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Programação</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-center items-center p-2 border-r border-b min-w-[120px]">
          <span className="font-medium">
            {formatPercentage(row.original.presence.programming)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "presence.english",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Inglês</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-center items-center p-2 border-r border-b min-w-[120px]">
          <span className="font-medium">
            {formatPercentage(row.original.presence.english)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "presence.softSkills",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Soft Skills</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-center items-center p-2 border-r border-b min-w-[120px]">
          <span className="font-medium">
            {formatPercentage(row.original.presence.softSkills)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "activities",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Atividades</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-center items-center p-2 border-r border-b min-w-[120px]">
          <span className="font-medium">
            {formatPercentage(row.original.activities)}
          </span>
        </div>
      ),
    },
  ];

  // Adicionar colunas dinâmicas dos testes Coodesh
  const coodeshColumns: ColumnDef<StudentOverview>[] = data.coodeshTests.map(
    (test) => ({
      id: `coodesh-${test.id}`,
      accessorFn: (row) => row.coodesh[test.id],
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>{test.name}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const value = row.original.coodesh[test.id];
        return (
          <div className="w-full h-full flex justify-center items-center p-2 border-r border-b min-w-[120px]">
            <span className="font-medium">
              {value ? formatPercentage(value) : "-"}
            </span>
          </div>
        );
      },
    })
  );

  // Adicionar colunas dinâmicas dos projetos
  const projectColumns: ColumnDef<StudentOverview>[] = data.projects.map(
    (project) => ({
      id: `project-${project.id}`,
      accessorFn: (row) => row.projects[project.id],
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>{project.name}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const value = row.original.projects[project.id];
        return (
          <div className="w-full h-full flex justify-center items-center p-2 border-r border-b min-w-[120px]">
            <span className="font-medium">
              {value ? formatGrade(value) : "-"}
            </span>
          </div>
        );
      },
    })
  );

  return [...baseColumns, ...coodeshColumns, ...projectColumns];
};
