"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import JobSheetData from "../job-sheet-data";
import JobCard from "./JobCard";
import { Input } from "@/components/ui/input";
import { JobType } from "@/types/jobs";

const JobsDataTable = ({
  jobs,
  handleUpdateJob,
  handleResendJobToCuration,
}: {
  jobs: JobType[];
  handleUpdateJob: (newJob: JobType) => void;
  handleResendJobToCuration: (jobId: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

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
                <JobSheetData
                  mode="edit"
                  currentJob={job}
                  handleUpdateJobs={handleUpdateJob}
                />
                <Button
                  onClick={() => handleResendJobToCuration(job.id)}
                  variant="destructive"
                  className="!px-2 w-max h-max items-start justify-start text-start"
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
