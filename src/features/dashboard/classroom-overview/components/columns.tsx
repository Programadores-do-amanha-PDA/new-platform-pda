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
          <div className="w-full h-full flex justify-between items-end pb-1 px-2 gap-4 border-r">
            <p className="font-semibold h-9 flex items-center">Usuário</p>
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
  ];

  const attendanceColumns: ColumnDef<StudentOverview>[] = data.classTypes.map(
    (classType) => ({
      id: `attendance-${classType.id}`,
      accessorFn: (row) => row.attendances[classType.id],
      header: ({ column }) => {
        return (
          <div className="w-full max-w-[200px]  h-full flex justify-between items-center px-2 gap-4 border-r">
            <p className="truncate" title={classType.name}>
              {classType.name}
            </p>
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
        const value = row.original.attendances[classType.id];
        console.log(row.original.attendances);
        return (
          <div className="w-full h-full flex justify-center items-center p-2 border-r border-b min-w-[120px]">
            <span className="font-medium">
              {value ? formatPercentage(value) : "0%"}
            </span>
          </div>
        );
      },
    })
  );

  const studentActivities = data.students.reduce((acc, student) => {
    acc += student.activities;
    return acc;
  }, 0);
  if (studentActivities > 0) {
    attendanceColumns.push({
      accessorKey: "activities",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-end pb-1 px-2 gap-4 border-r">
            <p className="font-semibold h-9 flex items-center">Atividades</p>
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
    });
  }

  // Adicionar colunas dinâmicas dos testes Coodesh
  const coodeshColumns: ColumnDef<StudentOverview>[] = data.coodeshTests.map(
    (test) => ({
      id: `coodesh-${test.id}`,
      accessorFn: (row) => row.coodesh[test.id],
      header: ({ column }) => {
        return (
          <div className="w-full max-w-[200px]  h-full flex justify-between items-center px-2 gap-4 border-r">
            <p className="truncate" title={test.name}>
              {test.name}
            </p>
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
          <div className="w-full max-w-[200px] h-full flex justify-between items-center px-2 gap-4 border-r">
            <p className="truncate">{project.name}</p>
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

  return Array.from(
    new Set([
      ...baseColumns,
      ...attendanceColumns,
      ...coodeshColumns,
      ...projectColumns,
    ])
  );
};
