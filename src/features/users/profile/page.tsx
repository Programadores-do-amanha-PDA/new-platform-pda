"use client";

import { Loader } from "lucide-react";

import { useAuth } from "@/features/auth/shared";
import { useUserProfileStore } from "./store";
import { ProfileDataTabs } from "./components/profile-data-tabs";

/**
 * User profile page component.
 * Displays user profile data with tabs for editing different profile sections.
 */
export default function Page() {
    const { profile } = useUserProfileStore();
    const { fetchSession, loading } = useAuth();

    // Loading state with accessibility
    if (loading) {
        return (
            <main className="relative flex flex-col p-4 w-full h-max overflow-y-auto">
                <div
                    className="flex flex-col justify-center items-center gap-4 rounded-xl w-full max-w-3xl h-max"
                    role="status"
                    aria-live="polite"
                >
                    <Loader />
                    <span className="sr-only">Loading profile data...</span>
                </div>
            </main>
        );
    }

    // Empty or error state
    if (!profile) {
        return (
            <main className="relative flex flex-col p-4 w-full h-max overflow-y-auto">
                <div
                    className="flex flex-col justify-center items-center gap-4 rounded-xl w-full max-w-3xl h-max"
                    role="alert"
                    aria-live="assertive"
                >
                    <p className="text-gray-500">Unable to load profile data. Please try again later.</p>
                </div>
            </main>
        );
    }

    // Profile loaded successfully
    return (
        <main className="relative flex flex-col p-4 w-full h-max overflow-y-auto">
            <div className="flex flex-col justify-center items-center gap-4 rounded-xl w-full max-w-3xl h-max">
                <ProfileDataTabs currentUser={profile} onUpdateUser={fetchSession} />
            </div>
        </main>
    );
}
