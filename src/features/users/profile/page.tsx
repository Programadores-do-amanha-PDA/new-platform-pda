"use client";

import { useAuth } from "@/features/auth/shared";
import { ProfileDataTabs } from "./components";

export default function Page() {
    const { user, fetchSession } = useAuth();
    if (!user) return;

    return (
        <main className="relative flex flex-col p-4 w-full h-max overflow-y-auto">
            <div className="flex flex-col justify-center items-center gap-4 rounded-xl w-full max-w-3xl h-max">
                <ProfileDataTabs currentUser={user} onUpdateUser={fetchSession} />
            </div>
        </main>
    );
}
