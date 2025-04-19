"use client";
import { AppBar } from "@/components/common/app-bar";
import ProfileDataTabs from "@/components/common/profile/profile-data-tabs";
import { useAuth } from "@/context/auth-context";

export default function UserHomeDashboard() {
  const { user, fetchSession } = useAuth();
  if (!user) return;

  return (
    <main className="relative w-full h-max flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="w-full max-w-3xl h-max rounded-xl flex flex-col items-center justify-center gap-4">
        <ProfileDataTabs currentUser={user} onUpdateUser={fetchSession} />
      </div>
    </main>
  );
}
