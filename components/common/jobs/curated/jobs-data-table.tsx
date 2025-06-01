"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import JobSheetData from "../job-sheet-data";
import JobCard from "./Job-card";
import { Input } from "@/components/ui/input";
import { JobT, JobWithApplicationsT } from "@/types/jobs";
import { Archive, FileArchive } from "lucide-react";
import JobCardDiscordSenderButton from "./job-card-discord-sender-button";

const JobsDataTable = ({
  jobs,
  handleUpdateJob,
  handleResendJobToCuration,
  handleArchiveJob,
  handleJobIsOnDiscord,
}: {
  jobs: JobWithApplicationsT[];
  handleUpdateJob: (jobId: string, job: Partial<JobT>) => Promise<boolean>;
  handleResendJobToCuration: (jobId: string) => Promise<boolean>;
  handleArchiveJob: (jobId: string) => Promise<boolean>;
  handleJobIsOnDiscord: (jobId: string) => Promise<boolean>;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const jobsSearchQuery = searchQuery.length
    ? jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery) ||
          job.company.toLowerCase().includes(searchQuery)
      )
    : jobs;

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Procurando por algo?"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <ul className="flex flex-row flex-wrap gap-4 py-4 overflow-y-auto">
        {jobsSearchQuery.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            cardFooter={
              <>
                <JobSheetData
                  mode="edit"
                  currentJob={job}
                  handleUpdateJob={handleUpdateJob}
                  handleCreateJob={() => Promise.resolve(false)}
                />

                <div className="flex gap-4">
                  <JobCardDiscordSenderButton
                    job={job}
                    handleJobIsOnDiscord={handleJobIsOnDiscord}
                  />

                  <Button
                    onClick={() => handleResendJobToCuration(job.id)}
                    variant="outline"
                    className="px-2! w-max h-max items-start justify-start text-start bg-orange-400/80!"
                    title="Reenviar para curadoria"
                  >
                    <FileArchive className="size-4" />
                  </Button>
                  <Button
                    onClick={() => handleArchiveJob(job.id)}
                    variant="destructive"
                    className="px-2! w-max h-max items-start justify-start text-start"
                    title="Arquivar Vaga"
                  >
                    <Archive className="size-4" />
                  </Button>
                </div>
              </>
            }
          />
        ))}
      </ul>
    </div>
  );
};

export default JobsDataTable;
