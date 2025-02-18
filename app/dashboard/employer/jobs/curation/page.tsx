"use client";
import JobsDataTable from "@/components/jobs/curation/jobs-data-table";
import { AppBar } from "@/components/app-bar";
import { useEmployerStack } from "@/context/employer/stack-context";

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
  } = useEmployerStack();
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <JobsDataTable
          jobs={jobs
            .filter((job) => job.curated === false)
            .filter((job) => job.is_archived === false)}
          handleCurateJob={handleCurateJob}
          handleCreateJob={handleCreateJob}
          handleUpdateJob={handleUpdateJob}
          handleArchiveJob={handleArchiveJob}
          loading={loading}
        />
      </div>
    </main>
  );
}
