"use client";
import { useEffect } from "react";
import PageLoader from "@/components/shared/page-loader";
import { useAuthStore } from "@/stores/shared/auth-store";

export default function AuthStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, fetchSession } = useAuthStore();

  useEffect(() => {
    fetchSession();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return children;
}
