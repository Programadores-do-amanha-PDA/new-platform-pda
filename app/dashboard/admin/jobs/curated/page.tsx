"use client";
import { AppBar } from "@/components/app-bar";
import JobsDataTable from "@/components/jobs/curated/jobs-data-table";
import { useAdminStackContext } from "@/context/admin/stack-context";

export default function Home() {
  const {
    jobsStack: { jobs, handleResendJobToCuration, handleUpdateJob },
  } = useAdminStackContext();
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <JobsDataTable
          jobs={jobs}
          handleResendJobToCuration={handleResendJobToCuration}
          handleUpdateJob={handleUpdateJob}
        />
      </div>
    </main>
  );
}
