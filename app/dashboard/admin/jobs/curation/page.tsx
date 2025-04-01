"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";

import JobsDataTable from "@/components/jobs/curation/jobs-data-table";

export default function Home() {
  const {
    jobsStack: {
      jobs,
      handleCurateJob,
      handleCreateJob,
      handleUpdateJob,
      handleArchiveJob,
    },
    loading,
  } = useAdminStackContext();
  return (
    <main className="relative w-full flex flex-col py-6 gap-4">
      <JobsDataTable
        jobs={jobs
          .filter((job) => job.curated === false)
          .filter((job) => job.is_archived === false)}
        handleCreateJob={handleCreateJob}
        handleUpdateJob={handleUpdateJob}
        handleCurateJob={handleCurateJob}
        handleArchiveJob={handleArchiveJob}
        loading={loading}
      />
    </main>
  );
}
