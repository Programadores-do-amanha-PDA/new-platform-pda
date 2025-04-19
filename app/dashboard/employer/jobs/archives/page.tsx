"use client";
import { AppBar } from "@/components/common/app-bar";
import JobsDataTable from "@/components/common/jobs/archives/jobs-data-table";
import { useEmployerStack } from "@/context/employer/stack-context";

export default function Home() {
  const {
    jobsStack: { jobs, handleDeleteJob, handleResendJobToCuration },
    loading,
  } = useEmployerStack();
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <JobsDataTable
          jobs={jobs
            .filter((job) => job.curated === false)
            .filter((job) => job.is_archived === true)}
          handleResendJobToCuration={handleResendJobToCuration}
          handleDeleteJob={handleDeleteJob}
          loading={loading}
        />
      </div>
    </main>
  );
}
