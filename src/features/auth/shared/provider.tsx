"use client";

import { useEffect } from "react";
import { redirect, usePathname } from "next/navigation";

import PageLoader from "@/components/shared/page-loader";

import { useAuthStore } from "./store";
import useAuthProcessUrlParams from "./hooks/use-auth-confirmation";

export default function AuthStoreProvider({ children }: { children: React.ReactNode }) {
    const path = usePathname();
    const { loading, fetchSession, session } = useAuthStore();

    useAuthProcessUrlParams();

    useEffect(() => {
        fetchSession();
    }, []);

    useEffect(() => {
        if (!loading && !session && path.startsWith("/dashboard")) {
            redirect("/sign-in");
        } else if (!loading && session && !path.startsWith("/dashboard")) {
            redirect("/dashboard");
        }
    }, [loading, session, path]);

    if (loading) {
        return <PageLoader />;
    }

    return children;
}
