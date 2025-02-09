"use client";
import { AppBar } from "@/components/app-bar";
import { ProfileAvatarPicker } from "@/components/profile/profile-avatar-picker";
import ProfileDataTabs from "@/components/profile/profile-data-tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

export default function UserHomeDashboard() {
  const { user, fetchSession } = useAuth();
  if (!user) return;

  return (
    <main className="relative w-full flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="p-4 w-full h-full bg-primary rounded-xl flex gap-4">
        <div className="w-52 h-max bg-card rounded-lg flex flex-col items-center justify-start gap-4 p-4">
          <ProfileAvatarPicker user={user} />
          <div className="flex flex-col gap-2 items-center justify-start">
            <p className="text-base font-bold">{user?.profile?.full_name}</p>
            <Badge variant="outline" className="font-normal">
              {user?.profile?.user_roles && user?.profile?.user_roles[0]?.role}
            </Badge>
          </div>
        </div>
        <ProfileDataTabs currentUser={user} onUpdateUser={fetchSession} />
      </div>
    </main>
  );
}
