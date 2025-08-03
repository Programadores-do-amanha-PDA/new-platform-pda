"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useCoodeshAssessmentStore } from "@/features/dashboard/classroom-coodesh/stores/assessments";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useDeliveryStore } from "@/stores/modules/classrooms/projects/deliveries";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import PageLoader from "@/components/shared/page-loader";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";
import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import { useClassroomStore } from "@/features/dashboard/classrooms/stores/classrooms";
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
  const projectStore = useProjectStore();
  const deliveryStore = useDeliveryStore();
  const zoomAccountStore = useZoomAccountStore();
  const zoomMeetingStore = useZoomMeetingStore();
  const zoomMeetingPastInstanceStore = useZoomMeetingPastInstanceStore();
  const classroomActivityStore = useClassroomActivityStore();

  const isLoading =
    classroomStore.loading ||
    coodeshAssessmentStore.loading ||
    projectStore.loading ||
    deliveryStore.loading ||
    zoomAccountStore.loading ||
    zoomMeetingStore.loading ||
    zoomMeetingPastInstanceStore.loading ||
    classroomActivityStore.loading;

  const loadAllData = useCallback(async () => {
    if (!classroomId) return;

    try {
      await classroomStore.getAllClassrooms();

      await coodeshAssessmentStore.getAllAssessmentsByClassroomId(classroomId);

      await projectStore.getAllProjectsWithDeliveriesAndCorrections(classroomId);

      await zoomAccountStore.getAllAccounts(classroomId);
      await zoomMeetingStore.getAllMeetings(classroomId);
      await zoomMeetingPastInstanceStore.getAllPastInstancesByClassroom(
        classroomId
      );

      await classroomActivityStore.getAllActivitiesByClassroom(classroomId);
    } catch (error) {
      console.error("Error loading classroom data:", error);
    }
  }, [
    classroomId,
    classroomStore,
    coodeshAssessmentStore,
    projectStore,
    zoomAccountStore,
    zoomMeetingStore,
    zoomMeetingPastInstanceStore,
    classroomActivityStore,
  ]);

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

  if (isLoading) {
    return <PageLoader />;
  }

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
