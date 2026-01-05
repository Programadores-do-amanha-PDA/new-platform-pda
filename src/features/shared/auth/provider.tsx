"use client";

import { useEffect } from "react";

import { redirect, usePathname } from "next/navigation";
import PageLoader from "@/components/shared/page-loader";
import { useAuthStore } from "./store";
import { useAuthProcessUrlParams } from "./hooks";

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
