"use client";
import { AppBar } from "@/components/app-bar";
import JobCard from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { JobType } from "@/types/jobs";
import { Flag } from "lucide-react";
import { useState } from "react";

export default function AllJobsPage() {
  const {
    jobsStack: { jobs },
    jobApplicationStack: { jobApplications, handleCreateJobApplication },
  } = useAlumniStack();

  const [jobSearch, setJobSearch] = useState<string>("");

  const handleSetJobSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobSearch(e.target.value);
  };

  const jobSearchFilter = jobSearch
    ? jobs.filter(
        (job) =>
          job.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
          job.title.toLowerCase().includes(jobSearch.toLowerCase())
      )
    : jobs;

  const handleApplyToJob = async (job: JobType) => {
    await handleCreateJobApplication({ job_id: job.id, status: "applied" });
  };

  return (
    <main className="w-full h-full relative flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="h-max flex flex-col gap-8">
        <div className="flex gap-2 items-center justify-start max-w-96">
          <Input
            placeholder="Pesquisar pelo titulo ou empresa"
            value={jobSearch}
            onChange={handleSetJobSearch}
          />
        </div>
        <div className="w-full h-max flex flex-wrap gap-4 overflow-y-auto">
          {jobSearchFilter.map((job, i) => {
            const jobApplicationExists = jobApplications.find(
              (apply) => apply.job_id === job.id
            );
            return (
              <JobCard
                key={i}
                job={job}
                cardFooter={
                  !jobApplicationExists ? (
                    <>
                      <Button
                        className="font-semibold"
                        onClick={() => handleApplyToJob(job)}
                      >
                        Já me candidatei!
                      </Button>
                      <Button className="font-semibold" variant="ghost">
                        <Flag className="size-5" />
                      </Button>
                    </>
                  ) : (
                    <p className="font-semibold text-sm py-2 px-4 gap-2 h-9">
                      Candidatura declarada!
                    </p>
                  )
                }
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
