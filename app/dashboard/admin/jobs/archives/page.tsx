"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";

import JobsDataTable from "@/components/jobs/archives/jobs-data-table";

export default function Home() {
  const {
    jobsStack: { jobs, handleDeleteJob, handleResendJobToCuration },
    loading,
  } = useAdminStackContext();
  return (
    <main className="relative w-full h-full flex flex-col py-6 gap-4">
      <JobsDataTable
        jobs={jobs
          .filter((job) => job.curated === false)
          .filter((job) => job.is_archived === true)}
        loading={loading}
        handleDeleteJob={handleDeleteJob}
        handleResendJobToCuration={handleResendJobToCuration}
      />
    </main>
  );
}
