"use client";
import { createContext, useContext, useEffect, useState } from "react";
import pathLabels from "@/utils/path-labels";
import { generateSidebarConfig, generatePathLabels, generateNoAccessSidebarConfig } from "./sidebar-config";
import PageLoader from "@/components/shared/page-loader";

import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useCoodeshAssessmentStore } from "@/features/dashboard/classroom-coodesh/stores/assessments";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { useUsersCombinedStore } from "@/stores/modules/users/users-combined-store";

import AppBar from "@/components/shared/app-bar";
import { AppSidebar } from "@/components/shared/sidebar";

import { SidebarDataT } from "@/types/sidebar";
import useAuth from "@/hooks/use-auth";
import { useClassroomStore } from "@/features/dashboard/classrooms/stores/classrooms";
import NoAccessPage from "@/components/shared/no-access-page";

interface AdminStackProviderProps {
  children: React.ReactNode;
  loadInitialData?: boolean;
}

const AdminStackContext = createContext({});

export const AdminStackProvider = ({
  children,
  loadInitialData = true,
}: AdminStackProviderProps) => {
  const [loading, setLoading] = useState(false);
  const { user, userRole } = useAuth();

  const classroomStore = useClassroomStore();
  const projectStore = useProjectStore();
  const coodeshAssessmentStore = useCoodeshAssessmentStore();
  const zoomMeetingStore = useZoomMeetingStore();
  const usersCombinedStore = useUsersCombinedStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!loadInitialData || !user || !userRole || userRole !== "admin")
        return;

      setLoading(true);
      try {
        await classroomStore.getAllClassrooms();
        await usersCombinedStore.getAllUsersWithProfiles();
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (!user || !userRole)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );

  if (loading && loadInitialData) {
    return <PageLoader />;
  }

  if (userRole !== "admin") {
    const sidebarData: SidebarDataT = generateNoAccessSidebarConfig(user)
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
  }

  const sidebarData: SidebarDataT = generateSidebarConfig(
    user,
    classroomStore.classrooms
  );

  const adminPathLabels = generatePathLabels(
    pathLabels,
    classroomStore.classrooms,
    zoomMeetingStore.meetings,
    coodeshAssessmentStore.assessments,
    projectStore.projects
  );

  return (
    <>
      <AppSidebar data={sidebarData} />
      <div className="relative w-full h-full flex flex-col bg-background !rounded-lg ml-1 shadow overflow-hidden">
        <AppBar pathLabels={adminPathLabels} />
        <div className="w-full h-full flex flex-col gap-10 overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
};

export const useAdminStackContext = () => useContext(AdminStackContext);
