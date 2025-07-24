"use client";
import { useEffect } from "react";
import { useUsersCombinedStore } from "@/stores/modules/users/users-combined-store";
import PageLoader from "@/components/shared/page-loader";
import { RolesT } from "@/types/auth";

interface UsersCombinedProviderProps {
  children: React.ReactNode;
  initialRole?: RolesT;
  loadUsers?: boolean;
}

/**
 * Combined provider that encompasses all user-related stores:
 * - Users Store: Manages user data and CRUD operations
 * - User Classrooms Store: Manages user-classroom relationships
 * - User Roles Store: Manages user roles
 */
export default function UsersCombinedProvider({
  children,
  initialRole,
  loadUsers = true,
}: UsersCombinedProviderProps) {
  const { getAllUsersWithProfiles, isLoading } = useUsersCombinedStore();
  
  useEffect(() => {
    if (loadUsers) {
      getAllUsersWithProfiles(initialRole);
    }
  }, []);

  if (isLoading() && loadUsers) {
    return <PageLoader />;
  }

  return children;
}