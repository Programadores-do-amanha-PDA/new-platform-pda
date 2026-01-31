"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../store";
import { useUserRoleStore } from "@/features/auth/access-control/stores";
import { requestPasswordResetByEmail, updateAuthUser } from "../actions";

/**
 * Custom hook for authentication logic and user session management.
 *
 * Provides access to authentication store, current user information, user role,
 * and utility functions for signing out, requesting password reset, and updating user data.
 *
 * @returns An object containing:
 * - All properties and methods from the authentication store
 * - `user`: The current authenticated user or `null`
 * - `userRole`: The role of the current user
 * - `handleRequestResetPassword`: Function to request password reset by email
 * - `updateUser`: Function to update authenticated user data
 * - `handleSignOut`: Function to sign out the user and redirect to the sign-in page
 */
export default function useAuth() {
    const authStore = useAuthStore();
    const { userRole: userRoleData } = useUserRoleStore();
    const router = useRouter();

    const user = useMemo(() => authStore.session?.user ?? null, [authStore.session]);
    const userRole = useMemo(() => userRoleData?.role, [userRoleData]);

    const handleSignOut = async () => {
        await authStore.signOut();
        router.push("/sign-in");
    };

    return {
        ...authStore,
        user,
        userRole,
        handleRequestResetPassword: requestPasswordResetByEmail,
        updateUser: updateAuthUser,
        handleSignOut,
    };
}
