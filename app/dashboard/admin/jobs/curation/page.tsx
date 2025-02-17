"use client";
import JobsDataTable from "@/components/jobs/curation/jobs-data-table";
import { AppBar } from "@/components/app-bar";
import { useAdminStackContext } from "@/context/admin/admin-stack-context";

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
          jobs={jobs}
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
