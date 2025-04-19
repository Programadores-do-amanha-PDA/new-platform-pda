"use client";
import { AppBar } from "@/components/common/app-bar";
import JobsDataTable from "@/components/common/jobs/curated/jobs-data-table";
import { useEmployerStack } from "@/context/employer/stack-context";

export default function Home() {
  const {
    jobsStack: {
      jobs,
      handleResendJobToCuration,
      handleUpdateJob,
      handleArchiveJob,
      handleJobIsOnDiscord,
    },
  } = useEmployerStack();
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <JobsDataTable
          jobs={jobs
            .filter((job) => job.curated === true)
            .filter((job) => job.is_archived === false)}
          handleResendJobToCuration={handleResendJobToCuration}
          handleUpdateJob={handleUpdateJob}
          handleArchiveJob={handleArchiveJob}
          handleJobIsOnDiscord={handleJobIsOnDiscord}
        />
      </div>
    </main>
  );
}
