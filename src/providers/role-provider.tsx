"use client";
import { createContext, useContext, ReactNode } from "react";
import useAuth from "@/hooks/use-auth";
import { AdminStackProvider } from "@/providers/admin/stack-provider";
import { StudentStackProvider } from "@/providers/student/stack-provider";
import { generateNoAccessSidebarConfig } from "@/providers/admin/sidebar-config";
import PageLoader from "@/components/shared/page-loader";
import AppBar from "@/components/shared/app-bar";
import { AppSidebar } from "@/components/shared/sidebar";
import NoAccessPage from "@/components/shared/no-access-page";
import pathLabels from "@/utils/path-labels";
import { SidebarDataT } from "@/types/sidebar";

interface RoleProviderProps {
  children: ReactNode;
}

const RoleContext = createContext({});

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const { user, userRole } = useAuth();

  if (!user || !userRole) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (userRole === "admin") {
    return <AdminStackProvider>{children}</AdminStackProvider>;
  }

  if (userRole === "student") {
    return <StudentStackProvider>{children}</StudentStackProvider>;
  }

  // Fallback para roles não reconhecidas
  const sidebarData: SidebarDataT = generateNoAccessSidebarConfig(user);
  return (
    <>
      <AppSidebar data={sidebarData} />
      <div className="relative w-full h-full flex flex-col bg-background !rounded-lg ml-1 shadow overflow-hidden">
        <AppBar pathLabels={pathLabels} />
        <div className="w-full h-full flex flex-col gap-10 overflow-hidden">
          <NoAccessPage />
        </div>
      </div>
    </>
  );
};

export const useRoleContext = () => useContext(RoleContext);
