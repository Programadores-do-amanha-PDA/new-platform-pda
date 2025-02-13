"use client";
import JobsDataTable from "@/components/jobs/curation/jobs-data-table";
import { AppBar } from "@/components/app-bar";
import { useAdminStackContext } from "@/context/admin/admin-stack-context";

export default function Home() {
  const {
    jobsStack: {
      jobs,
      handleCurateJob,
      handleDeleteJob,
      handleInsertNewJob,
      handleUpdateJob,
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
          handleDeleteJob={handleDeleteJob}
          handleInsertNewJob={handleInsertNewJob}
          handleUpdateJob={handleUpdateJob}
          loading={loading}
        />
      </div>
    </main>
  );
}
