"use client";
import ProfilesDataTable from "@/components/users/profiles-data-table";
import { AppBar } from "@/components/app-bar";

export default function Home() {
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <ProfilesDataTable />
      </div>
    </main>
  );
}
