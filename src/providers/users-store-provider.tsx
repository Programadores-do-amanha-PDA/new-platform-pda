"use client";
import { useEffect } from "react";

import { useUsersStore } from "@/stores/modules/users/users-store";

import PageLoader from "@/components/shared/page-loader";

import { RolesT } from "@/types/auth";

interface UsersStoreProviderProps {
  children: React.ReactNode;
  initialRole?: RolesT;
  loadUsers?: boolean;
}

export default function UsersStoreProvider({
  children,
  initialRole,
  loadUsers = true,
}: UsersStoreProviderProps) {
  const { loading, getAllUsersWithProfiles } = useUsersStore();

  useEffect(() => {
    if (loadUsers) {
      getAllUsersWithProfiles({role: initialRole});
    }
  }, []);

  if (loading && loadUsers) {
    return <PageLoader />;
  }

  return children;
}
