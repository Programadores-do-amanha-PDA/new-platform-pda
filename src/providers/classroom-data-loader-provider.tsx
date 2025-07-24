"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useClassroomStore } from "@/stores/modules/classrooms";
import { useCoodeshAssessmentStore } from "@/stores/modules/classrooms/coodesh/assessments";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useDeliveryStore } from "@/stores/modules/classrooms/projects/deliveries";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import PageLoader from "@/components/shared/page-loader";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";
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

  const isLoading =
    classroomStore.loading ||
    coodeshAssessmentStore.loading ||
    projectStore.loading ||
    deliveryStore.loading ||
    zoomAccountStore.loading ||
    zoomMeetingStore.loading ||
    zoomMeetingPastInstanceStore.loading;

  const loadAllData = useCallback(async () => {
    if (!classroomId) return;

    try {
      await classroomStore.getAllClassrooms();

      await coodeshAssessmentStore.getAllAssessmentsByClassroomId(classroomId);

      await projectStore.getAllProjectsByClassroomId(classroomId);

      await zoomAccountStore.getAllAccounts(classroomId);
      await zoomMeetingStore.getAllMeetings(classroomId);
      await zoomMeetingPastInstanceStore.getAllPastInstancesByClassroom(
        classroomId
      );
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
