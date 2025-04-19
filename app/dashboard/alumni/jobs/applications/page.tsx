"use client";
import { AppBar } from "@/components/common/app-bar";
import JobApplicationCard from "@/components/common/jobs/application/job-application-card";
import { Input } from "@/components/ui/input";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { useState } from "react";

export default function AllJobsPage() {
  const {
    jobApplicationStack: {
      jobApplications,
      handleDeleteJobApplication,
      handleUpdateJobApplicationStatus,
    },
  } = useAlumniStack();

  const [jobApplicationSearch, setJobApplicationSearch] = useState<string>("");

  const jobApplicationSearchFilter = jobApplicationSearch
    ? jobApplications.filter((jobApplication) => {
        return (
          jobApplication.jobs !== null &&
          (jobApplication.jobs?.company
            .toLowerCase()
            .includes(jobApplicationSearch.toLowerCase()) ||
            jobApplication.jobs?.title
              .toLowerCase()
              .includes(jobApplicationSearch.toLowerCase()))
        );
      })
    : jobApplications;

  return (
    <main className="relative w-full flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="h-max flex flex-col gap-8">
        <div className="flex gap-2 items-center justify-start max-w-96">
          <Input
            placeholder="Pesquisar pelo titulo ou empresa"
            value={jobApplicationSearch}
            onChange={(e) => setJobApplicationSearch(e.target.value)}
          />
        </div>
        <ul className="w-full h-max flex flex-wrap gap-4 overflow-y-auto">
          {jobApplicationSearchFilter.map((jobApplication, i) => {
            if (!jobApplication.jobs?.id) return null;

            return (
              <JobApplicationCard
                key={i}
                job={jobApplication.jobs}
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
