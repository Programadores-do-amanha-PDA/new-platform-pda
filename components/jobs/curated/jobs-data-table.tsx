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
import { useEffect, useState } from "react";

import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { JobDetailsType, JobType } from "@/types/jobs";
import { toast } from "sonner";
import JobSheetData from "../job-sheet-data";

const JobsDataTable = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/jobs");
        setJobs(response.data.results);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await axios.delete(`/api/jobs?id=${jobId}`);
      if (response.status === 200) {
        toast.success("Vaga deletada com sucesso!");
        const filteredProfiles = jobs.filter((job) => job.id !== jobId);
        setJobs(filteredProfiles);
        return true;
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Erro ao deletar a vaga");
      return false;
    }
  };

  const handleResendJobToCuration = async (jobId: string) => {
    try {
      const data = {
        jobId: jobId,
        updates: {
          curated: false,
        },
      };

      const response = await axios.put(`/api/jobs`, data);
      if (response.status === 200) {
        const filteredProfiles = jobs.map((job) =>
          job.id === jobId ? { ...job, curated: false } : job
        );
        setJobs(filteredProfiles);

        toast.success("Vaga reenviada para curadoria com sucesso!");
        return true;
      }
    } catch (error) {
      console.error("Error resend to curation job:", error);
      toast.error("Erro ao reenviar a vaga para a curadoria.");
      return false;
    }
  };

  const handleSetNewJob = (newJob: JobType) => {
    setJobs((jobs) => [...jobs, newJob]);
  };

  const handleUpdateJob = (newJob: JobType) => {
    const updatedJobs = jobs.map((job) =>
      job.id === newJob.id ? newJob : job
    );
    setJobs(updatedJobs);
  };

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
      accessorKey: "details",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Localização
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">
          {row.getValue<JobDetailsType>("details").locale[0]}
        </div>
      ),
    },
    {
      accessorKey: "languages",
      header: () => <div className="px-2 text-left">Tecnologias</div>,

      cell: ({ row }) => {
        return row
          .getValue<JobDetailsType>("details")
          .languages?.map((language, i) => (
            <Badge variant="outline" key={i}>
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
            <Badge variant="outline" key={i}>
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
              <JobSheetData
                mode="edit"
                currentJob={job}
                handleUpdateJobs={handleUpdateJob}
              />
              <Button
                onClick={() => handleResendJobToCuration(job.id)}
                variant="ghost"
                className="!px-2 w-full h-max items-start justify-start text-start"
              >
                Reenviar para a curadoria
              </Button>
              <Button
                onClick={() => handleDeleteJob(job.id)}
                variant="destructive"
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
      data={jobs.filter((job) => job.curated === true)}
      loading={loading}
      handleSetNewJob={handleSetNewJob}
    />
  );
};

export default JobsDataTable;
