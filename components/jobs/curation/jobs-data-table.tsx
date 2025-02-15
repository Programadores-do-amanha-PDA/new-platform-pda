"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../data-table";
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

import { Badge } from "@/components/ui/badge";
import { JobDetailsType, JobType } from "@/types/jobs";
import JobSheetData from "../job-sheet-data";

const JobsDataTable = ({
  jobs,
  handleInsertNewJob,
  handleUpdateJob,
  handleDeleteJob,
  handleCurateJob,
  loading,
}: {
  jobs: JobType[];
  handleInsertNewJob: (job: JobType) => void;
  handleUpdateJob: (job: JobType) => void;
  handleDeleteJob: (jobId: string) => Promise<void>;
  handleCurateJob: (jobId: string) => Promise<void>;
  loading: boolean;
}) => {
  const columns: ColumnDef<JobType>[] = [
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-left px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Titulo
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "company",
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
        <div className="lowercase">{row.getValue("company")}</div>
      ),
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
      accessorKey: "details",
      header: () => <div className="px-2 text-left">Tecnologias</div>,

      cell: ({ row }) => {
        return row
          .getValue<JobDetailsType>("details")
          .languages?.map((language, i) => (
            <Badge variant="outline" className="!m-1" key={i}>
              {language}
            </Badge>
          ));
      },
    },
    {
      accessorKey: "workplace_type",
      header: () => <div className="px-2 text-left">Local de Trabalho</div>,

      cell: ({ row }) => {
        return row
          .getValue<JobDetailsType>("details")
          .workplace_type?.map((w, i) => (
            <Badge variant="outline" className="!m-1" key={i}>
              {w}
            </Badge>
          ));
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const job = row.original;

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
              <Button
                onClick={() => handleCurateJob(job.id)}
                variant="ghost"
                className="!px-2 w-full h-max items-start justify-start text-start"
              >
                Aprovar Vaga
              </Button>
              <JobSheetData
                mode="edit"
                currentJob={job}
                handleUpdateJobs={handleUpdateJob}
              />
              <Button
                onClick={() => handleDeleteJob(job.id)}
                variant="ghost"
                className="!px-2 w-full h-max items-start justify-start text-start"
              >
                Deletar Vaga
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={jobs.filter((job) => job.curated === false)}
      loading={loading}
      handleSetNewJob={handleInsertNewJob}
    />
  );
};

export default JobsDataTable;
