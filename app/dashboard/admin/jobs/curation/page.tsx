"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";

import JobsDataTable from "@/components/jobs/curation/jobs-data-table";
import { AppBar } from "@/components/app-bar";

export default function Home() {
  const {
    jobsStack: {
      jobs,
      handleCurateJob,
      handleInsertNewJob,
      handleUpdateJob,
      handleArchiveJob,
    },
    loading,
  } = useAdminStackContext();
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <JobsDataTable
          jobs={jobs
            .filter((job) => job.curated === false)
            .filter((job) => job.is_archived === false)}
          handleCurateJob={handleCurateJob}
          handleInsertNewJob={handleInsertNewJob}
          handleUpdateJob={handleUpdateJob}
          handleArchiveJob={handleArchiveJob}
          loading={loading}
        />
      </div>
    </main>
  );
}
