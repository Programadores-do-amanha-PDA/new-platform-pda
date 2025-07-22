"use client";
import useAuth from "@/hooks/use-auth";
import ProfileDataTabs from "./components/profile-data-tabs";

export default function Page() {
  const { user, fetchSession } = useAuth();
  if (!user) return;

  return (
    <main className="relative w-full h-max flex flex-col p-4 overflow-y-auto">
      <div className="w-full max-w-3xl h-max rounded-xl flex flex-col items-center justify-center gap-4">
        <ProfileDataTabs currentUser={user} onUpdateUser={fetchSession} />
      </div>
    </main>
  );
}
