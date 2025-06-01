"use client";
import JobCard from "@/components/common/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { useAuth } from "@/context/auth-context";
import { JobT } from "@/types/jobs";
import { Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AllJobsPage() {
  const { user } = useAuth();
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

  const handleApplyToJob = async (job: JobT) => {
    if (!user)
      return toast.error("Você precisa estar logado para se candidatar!");
    await handleCreateJobApplication(
      { job_id: job.id, status: "applied" },
      user
    );
  };

  return (
    <main className="w-full h-full relative flex flex-col p-6 gap-4 xl:p-8 overflow-hidden">
      <div className="h-full w-full flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-2 items-center justify-start  w-full md:max-w-sm">
          <Input
            placeholder="Pesquisar pelo titulo ou empresa"
            value={jobSearch}
            onChange={handleSetJobSearch}
          />
        </div>
        <div className="flex h-full w-full overflow-y-auto">
          <ul className="w-full h-max flex flex-wrap gap-4 lg:gap-8 my-4 pr-4">
            {jobSearchFilter.map((job, i) => {
              const JobApplicationTExists = jobApplications.find(
                (apply) => apply.job_id === job.id
              );
              return (
                <JobCard
                  key={i}
                  job={job}
                  cardFooter={
                    !JobApplicationTExists ? (
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
          </ul>
        </div>
      </div>
    </main>
  );
}
