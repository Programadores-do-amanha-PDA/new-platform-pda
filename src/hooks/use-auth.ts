"use client";

import { useRouter } from "next/navigation";

import { updateAuthUser, requestPasswordResetByEmail, signOut } from "@/actions";
import { useAuthStore } from "@/stores/shared/auth-store";

export default function useAuth() {
    const store = useAuthStore();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        store.reset();
        router.push("/sign-in");
    };

    return {
        ...store,
        handleRequestResetPassword: requestPasswordResetByEmail,
        handleUpdateUser: updateAuthUser,
        handleSignOut,
    };
}
