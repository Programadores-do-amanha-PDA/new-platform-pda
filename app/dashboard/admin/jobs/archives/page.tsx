"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";

import { AppBar } from "@/components/app-bar";
import JobsDataTable from "@/components/jobs/archives/jobs-data-table";

export default function Home() {
  const {
    jobsStack: { jobs, handleDeleteJob, handleResendJobToCuration },
    loading,
  } = useAdminStackContext();
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <JobsDataTable
          jobs={jobs
            .filter((job) => job.curated === false)
            .filter((job) => job.is_archived === true)}
          handleDeleteJob={handleDeleteJob}
          loading={loading}
          handleResendJobToCuration={handleResendJobToCuration}
        />
      </div>
    </main>
  );
}
