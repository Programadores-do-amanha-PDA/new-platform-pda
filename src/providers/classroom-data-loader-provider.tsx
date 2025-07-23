"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useClassroomStore } from "@/stores/modules/classrooms";
import { useCoodeshAssessmentStore } from "@/stores/modules/classrooms/coodesh/assessments";
import { useCoodeshAPIAssessmentStore } from "@/stores/modules/classrooms/coodesh/api";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useDeliveryStore } from "@/stores/modules/classrooms/projects/deliveries";
import { useZoomAPIStore } from "@/stores/modules/classrooms/zoom/api";
import { createZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { createZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import PageLoader from "@/components/shared/page-loader";

interface ClassroomDataLoaderContextType {
  isLoading: boolean;
  classroomId: string;
  refreshData: () => Promise<void>;
}

const ClassroomDataLoaderContext = createContext<
  ClassroomDataLoaderContextType | undefined
>(undefined);

interface ClassroomDataLoaderProviderProps {
  children: ReactNode;
  classroomId: string;
}

export function ClassroomDataLoaderProvider({
  children,
  classroomId,
}: ClassroomDataLoaderProviderProps) {
  const classroomStore = useClassroomStore();
  const coodeshAssessmentStore = useCoodeshAssessmentStore();
  const coodeshAPIStore = useCoodeshAPIAssessmentStore();
  const projectStore = useProjectStore();
  const deliveryStore = useDeliveryStore();
  const zoomAPIStore = useZoomAPIStore();

  const zoomAccountStore = createZoomAccountStore({
    getZoomMeAccountDataByAPI: zoomAPIStore.getZoomMeAccountDataByAPI,
  })();

  const zoomMeetingStore = createZoomMeetingStore({
    getMeetingByAPI: zoomAPIStore.getMeetingByAPI,
  })();

  const isLoading =
    classroomStore.loading ||
    coodeshAssessmentStore.loading ||
    coodeshAPIStore.loading ||
    projectStore.loading ||
    deliveryStore.loading ||
    zoomAPIStore.loading ||
    zoomAccountStore.loading ||
    zoomMeetingStore.loading;

  const loadAllData = async () => {
    if (!classroomId) return;

    try {
      await classroomStore.getAllClassrooms();

      await coodeshAssessmentStore.getAllAssessmentsByClassroomId(classroomId);
      await coodeshAPIStore.getApiAssessments();

      await projectStore.getAllProjectsByClassroomId(classroomId);

      await zoomAccountStore.getAllAccounts(classroomId);
      await zoomMeetingStore.getAllMeetings(classroomId);

    } catch (error) {
      console.error("Error loading classroom data:", error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [classroomId]);

  const refreshData = async () => {
    await loadAllData();
  };

  const contextValue: ClassroomDataLoaderContextType = {
    isLoading,
    classroomId,
    refreshData,
  };

  return (
    <ClassroomDataLoaderContext.Provider value={contextValue}>
      {children}
    </ClassroomDataLoaderContext.Provider>
  );
}

export function useClassroomDataLoader() {
  const context = useContext(ClassroomDataLoaderContext);
  if (context === undefined) {
    throw new Error(
      "useClassroomDataLoader must be used within a ClassroomDataLoaderProvider"
    );
  }

  if (context.isLoading) {
    return <PageLoader />;
  }
  return context;
}
