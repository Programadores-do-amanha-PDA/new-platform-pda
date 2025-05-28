"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import PageLoader from "@/components/shared/page-loader";

export default function AuthStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isRedirecting, fetchSession } = useAuthStore();

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  if (loading || isRedirecting) {
    return <PageLoader />;
  }

  return children;
}
