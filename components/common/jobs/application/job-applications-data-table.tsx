"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { JobApplicationWithJobT, JobT } from "@/types/jobs";
import { DataTable } from "./data-table";
import { Badge } from "@/components/ui/badge";
import JobApplicationTSheetData from "./job-application-sheet-data";

const JobApplicationTsDataTable = ({
  JobApplications,
  handleDeleteJobApplicationT,
  handleUpdateJobApplicationT,
}: {
  JobApplications: JobApplicationWithJobT[];
  handleUpdateJobApplicationT: (
    applicationId: number,
    application: "applied" | "rejected" | "accepted"
  ) => Promise<boolean>;
  handleDeleteJobApplicationT: (applicationId: number) => Promise<boolean>;
}) => {
  const columns: ColumnDef<JobApplicationWithJobT>[] = [
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
      accessorKey: "title",
      header: () => {
        return (
          <Button variant="ghost" className="text-left px-2">
            Titulo
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="lowercase">{row.getValue<JobT>("job").title}</div>
        );
      },
    },
    {
      accessorKey: "job",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Empresa
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue<JobT>("job").company}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const statusLabels = {
          applied: "Candidatura enviada",
          rejected: "Candidatura rejeitada",
          accepted: "Candidatura",
        };
        return (
          <Badge variant="outline">
            {
              statusLabels[
                row.getValue<"applied" | "rejected" | "accepted">("status")
              ]
            }
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Criada em
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
      accessorKey: "updated_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Atualizada em
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const createdAt = row.getValue("updated_at") as string;
        if (createdAt) {
          const date = new Date(createdAt);
          const formattedDate = `${date
            .getDate()
            .toString()
            .padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
          return <div className="lowercase">{formattedDate}</div>;
        } else if (!createdAt) {
          return <div className="lowercase">--</div>;
        }
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const JobApplicationT = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir Menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-w-52 flex flex-col gap-1"
            >
              <div>
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
              </div>
              <JobApplicationTSheetData
                currentJobApplicationT={JobApplicationT}
                handleUpdateJobApplicationT={handleUpdateJobApplicationT}
              />
              <Button
                onClick={() => handleDeleteJobApplicationT(JobApplicationT.id)}
                variant="ghost"
                className="!px-2 w-full h-max items-start justify-start text-start"
              >
                Deletar Candidatura
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={JobApplications} loading={false} />;
};

export default JobApplicationTsDataTable;
