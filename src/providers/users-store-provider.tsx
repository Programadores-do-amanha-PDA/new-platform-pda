"use client";
import { useEffect } from "react";

import PageLoader from "@/components/shared/page-loader";
import { useUsersStore } from "@/features/users/management";
import { Role } from "@/features/auth/access-control/types";


interface UsersStoreProviderProps {
  children: React.ReactNode;
  initialRole?: Role;
  loadUsers?: boolean;
}

export default function UsersStoreProvider({
  children,
  initialRole,
  loadUsers = true,
}: UsersStoreProviderProps) {
  const { loading, fetchAllUsersWithProfiles } = useUsersStore();

  useEffect(() => {
    if (loadUsers) {
      fetchAllUsersWithProfiles({role: initialRole});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRole]);

  if (loading && loadUsers) {
    return <PageLoader />;
  }

  return children;
}
