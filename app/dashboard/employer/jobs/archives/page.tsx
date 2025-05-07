"use client";
import { useEmployerStack } from "@/context/employer/stack-context";

import JobsDataTable from "@/components/common/jobs/archives/jobs-data-table";

export default function Home() {
  const {
    jobsStack: {
      jobs,
      handleDeleteJob,
      handleResendJobToCuration,
      jobsLoading,
    },
  } = useEmployerStack();
  return (
    <main className="relative w-full h-full flex flex-col p-4 gap-4">
      <JobsDataTable
        jobs={jobs
          .filter((job) => job.curated === false)
          .filter((job) => job.is_archived === true)}
        loading={jobsLoading}
        handleDeleteJob={handleDeleteJob}
        handleResendJobToCuration={handleResendJobToCuration}
      />
    </main>
  );
}
