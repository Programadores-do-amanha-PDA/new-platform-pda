"use client";
import JobApplicationCard from "@/components/common/jobs/application/job-application-card";
import { Input } from "@/components/ui/input";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { useState } from "react";

export default function AllJobsPage() {
  const {
    jobsStack: { jobs },
    jobApplicationStack: {
      jobApplications,
      handleDeleteJobApplication,
      handleUpdateJobApplicationStatus,
    },
  } = useAlumniStack();

  const [jobApplicationSearch, setJobApplicationTSearch] = useState<string>("");

  const jobApplicationSearchFilter = jobApplicationSearch
    ? jobApplications.filter((jobApplication) => {
      const currentJob = jobs.find(
        (job) => job.id === jobApplication.job_id
      );
        return (
          currentJob !== undefined &&
          (currentJob.company
            .toLowerCase()
            .includes(jobApplicationSearch.toLowerCase()) ||
            currentJob.title
              .toLowerCase()
              .includes(jobApplicationSearch.toLowerCase()))
        );
      })
    : jobApplications;

  return (
    <main className="relative w-full flex flex-col p-6 gap-10 xl:p-8">
      <div className="h-max flex flex-col gap-8">
        <div className="flex gap-2 items-center justify-start max-w-96">
          <Input
            placeholder="Pesquisar pelo titulo ou empresa"
            value={jobApplicationSearch}
            onChange={(e) => setJobApplicationTSearch(e.target.value)}
          />
        </div>
        <ul className="w-full h-max flex flex-wrap gap-4 overflow-y-auto">
          {jobApplicationSearchFilter.map((jobApplication, i) => {
            if (!jobApplication.id) return null;
            const currentJob = jobs.find(
              (job) => job.id === jobApplication.job_id
            );
            if (!currentJob) return null;

            return (
              <JobApplicationCard
                key={i}
                job={currentJob}
                jobApplication={jobApplication}
                handleDeleteJobApplication={handleDeleteJobApplication}
                handleUpdateJobApplicationStatus={
                  handleUpdateJobApplicationStatus
                }
              />
            );
          })}
        </ul>
      </div>
    </main>
  );
}
