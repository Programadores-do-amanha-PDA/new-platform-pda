"use client";
import { AppBar } from "@/components/app-bar";
import JobsDataTable from "@/components/jobs/curated/jobs-data-table";

export default function Home() {
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <JobsDataTable />
      </div>
    </main>
  );
}
