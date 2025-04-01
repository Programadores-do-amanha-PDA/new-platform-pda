"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";

import JobsDataTable from "@/components/jobs/curated/jobs-data-table";

export default function Home() {
  const {
    jobsStack: {
      jobs,
      handleResendJobToCuration,
      handleUpdateJob,
      handleArchiveJob,
      handleJobIsOnDiscord,
    },
  } = useAdminStackContext();
  return (
    <main className="relative w-full flex flex-col py-6 gap-4 overflow-hidden">
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
