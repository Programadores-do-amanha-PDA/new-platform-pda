"use client";
import { useEmployerStack } from "@/context/employer/stack-context";

import JobsDataTable from "@/components/common/jobs/curated/jobs-data-table";

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
    <main className="relative w-full flex flex-col p-4 gap-4 overflow-hidden">
      <JobsDataTable
        jobs={jobs
          .filter((job) => job.curated === true)
          .filter((job) => job.is_archived === false)}
        handleResendJobToCuration={handleResendJobToCuration}
        handleUpdateJob={handleUpdateJob}
        handleArchiveJob={handleArchiveJob}
        handleJobIsOnDiscord={handleJobIsOnDiscord}
      />
    </main>
  );
}
