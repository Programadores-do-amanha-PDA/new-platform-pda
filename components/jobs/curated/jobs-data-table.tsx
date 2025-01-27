"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import axios from "axios";
import { JobType } from "@/types/jobs";
import { toast } from "sonner";
import JobSheetData from "../job-sheet-data";
import JobCard from "./JobCard";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const JobsDataTable = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleUpdateJob = (newJob: JobType) => {
    const updatedJobs = jobs.map((job) =>
      job.id === newJob.id ? newJob : job
    );
    setJobs(updatedJobs);
  };

  const jobsSearchQuery = searchQuery.length
    ? jobs
        .filter((job) => job.curated === true)
        .filter(
          (job) =>
            job.title.toLowerCase().includes(searchQuery) ||
            job.company.toLowerCase().includes(searchQuery)
        )
    : jobs.filter((job) => job.curated === true);

  return (
    <div className="w-full h-full flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Procurando por algo?"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <ul className="flex flex-row flex-wrap gap-4 py-4">
        {jobsSearchQuery.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            cardFooter={
              <>
                <Button
                  variant={"default"}
                  onClick={() => window.open(job.link)}
                  className="w-max"
                >
                  <Send />
                </Button>
                <JobSheetData
                  mode="edit"
                  currentJob={job}
                  handleUpdateJobs={handleUpdateJob}
                />
                <Button
                  onClick={() => handleResendJobToCuration(job.id)}
                  variant="destructive"
                  className="!px-2 w-full h-max items-start justify-start text-start"
                >
                  Reenviar para a curadoria
                </Button>
              </>
            }
          />
        ))}
      </ul>
    </div>
  );
};

export default JobsDataTable;
