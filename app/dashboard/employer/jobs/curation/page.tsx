"use client";
import { useEmployerStack } from "@/context/employer/stack-context";

import JobsDataTable from "@/components/common/jobs/curation/jobs-data-table";

export default function Home() {
  const {
    jobsStack: {
      jobs,
      handleCurateJob,
      handleCreateJob,
      handleUpdateJob,
      handleArchiveJob,
      jobsLoading,
    },
  } = useEmployerStack();
  return (
    <main className="relative w-full flex flex-col p-4 gap-4">
      <JobsDataTable
        jobs={jobs
          .filter((job) => job.curated === false)
          .filter((job) => job.is_archived === false)}
        handleCreateJob={handleCreateJob}
        handleUpdateJob={handleUpdateJob}
        handleCurateJob={handleCurateJob}
        handleArchiveJob={handleArchiveJob}
        loading={jobsLoading}
      />
    </main>
  );
}
