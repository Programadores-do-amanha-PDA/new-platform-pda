"use client";

import { useRouter } from "next/navigation";

import { updateAuthUser, requestPasswordResetByEmail, signOut } from "@/actions";
import { useMemo } from "react";
import { useAuthStore } from "@/features/shared/auth";

export default function useAuth() {
    const store = useAuthStore();
    const router = useRouter();
    const { user } = store;
    const userRole = useMemo(() => user?.profile.user_role?.role, [user]);

    const handleSignOut = async () => {
        await signOut();
        store.reset();
        router.push("/sign-in");
    };

    return {
        ...store,
        userRole,
        handleRequestResetPassword: requestPasswordResetByEmail,
        updateUser: updateAuthUser,
        handleSignOut,
    };
}
