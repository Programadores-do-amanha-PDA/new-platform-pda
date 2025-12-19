"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/shared/auth-store";

import { redirect, usePathname } from "next/navigation";
import PageLoader from "@/components/shared/page-loader";
import useAuthProcessUrlParams from "@/features/shared/auth/hooks/use-auth-confirmation";

export default function AuthStoreProvider({ children }: { children: React.ReactNode }) {
    const path = usePathname();
    const { loading, fetchSession, user } = useAuthStore();

    useAuthProcessUrlParams();

    useEffect(() => {
        fetchSession();
    }, []);

    useEffect(() => {
        if (!loading && !user && path.startsWith("/dashboard")) {
            redirect("/sign-in");
        } else if (!loading && user && !path.startsWith("/dashboard")) {
            redirect("/dashboard");
        }
    }, [loading, user, path]);

    if (loading) {
        return <PageLoader />;
    }

    return children;
}
