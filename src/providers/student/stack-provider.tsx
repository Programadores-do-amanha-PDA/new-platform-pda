"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useAuth from "@/hooks/use-auth";
import PageLoader from "@/components/shared/page-loader";
import AppBar from "@/components/shared/app-bar";
import { AppSidebar } from "@/components/shared/sidebar";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { useUsersCombinedStore } from "@/stores/modules/users/users-combined-store";
import { generateSidebarConfig, generatePathLabels } from "./sidebar-config";
import pathLabels from "@/utils/path-labels";
import { SidebarDataT } from "@/types";

import { useCoodeshAssessmentStore } from "@/features/dashboard/classroom-coodesh/stores/assessments";
import { useClassroomStore } from "@/features/dashboard/classrooms/stores/classrooms";
import { useProjectStore } from "@/features/dashboard/classroom-projects/stores";

interface StudentStackProviderProps {
  children: React.ReactNode;
  loadInitialData?: boolean;
}

const StudentStackContext = createContext({});

export const StudentStackProvider = ({
  children,
  loadInitialData = true,
}: StudentStackProviderProps) => {
  const [loading, setLoading] = useState(false);
  const { user, userRole } = useAuth();

  const classroomStore = useClassroomStore();
  const projectStore = useProjectStore();
  const coodeshAssessmentStore = useCoodeshAssessmentStore();
  const zoomMeetingStore = useZoomMeetingStore();
  const usersCombinedStore = useUsersCombinedStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!loadInitialData || !user || !userRole || userRole !== "student")
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

export const useStudentStackContext = () => useContext(StudentStackContext);
