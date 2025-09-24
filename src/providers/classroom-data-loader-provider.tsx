"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useCoodeshAssessmentStore } from "@/features/dashboard/classroom-coodesh/stores/assessments";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import PageLoader from "@/components/shared/page-loader";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";
import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import { useClassroomStore } from "@/features/dashboard/classrooms/stores/classrooms";
import { useProjectStore } from "@/features/dashboard/classroom-projects/stores";
import { useDeliveryStore } from "@/features/dashboard/classroom-projects/stores/deliveries";
import { useCorrectionStore } from "@/features/dashboard/classroom-projects/stores/corrections";
import useAuth from "@/hooks/use-auth";
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
  const correctionStore = useCorrectionStore();
  const zoomAccountStore = useZoomAccountStore();
  const zoomMeetingStore = useZoomMeetingStore();
  const zoomMeetingPastInstanceStore = useZoomMeetingPastInstanceStore();
  const classroomActivityStore = useClassroomActivityStore();
  const classroomConfigStore = useClassroomConfigStore();
  const { userRole } = useAuth();

  const isLoading =
    classroomStore.loading ||
    classroomConfigStore.loading ||
    coodeshAssessmentStore.loading ||
    projectStore.loading ||
    deliveryStore.loading ||
    correctionStore.loading ||
    zoomAccountStore.loading ||
    zoomMeetingStore.loading ||
    zoomMeetingPastInstanceStore.loading ||
    classroomActivityStore.loading;

  const loadAllData = useCallback(async () => {
    if (!classroomId) return;

    try {
      if (userRole === "teacher" || userRole === "admin") {
        await Promise.all([
          classroomConfigStore.getConfigByClassroom(classroomId),
          coodeshAssessmentStore.getAllAssessmentsByClassroomId(classroomId),
          projectStore.getAllProjectsByClassroomId(classroomId),
          deliveryStore.getAllDeliveriesByClassroomId(classroomId),
          correctionStore.getAllCorrectionsByClassroomId(classroomId),
          zoomAccountStore.getAllAccounts(classroomId),
          zoomMeetingStore.getAllMeetings(classroomId),
          zoomMeetingPastInstanceStore.getAllPastInstancesByClassroom(
            classroomId
          ),
          classroomActivityStore.getAllActivitiesByClassroom(classroomId),
        ]);
      } else {
        await Promise.all([
          classroomConfigStore.getConfigByClassroom(classroomId),
          // coodeshAssessmentStore.getAllAssessmentsByClassroomId(classroomId),
          projectStore.getAllProjectsByClassroomId(classroomId),
          deliveryStore.getAllDeliveriesByClassroomId(classroomId),
          // correctionStore.getAllCorrectionsByClassroomId(classroomId),
          // zoomAccountStore.getAllAccounts(classroomId),
          // zoomMeetingStore.getAllMeetings(classroomId),
          // zoomMeetingPastInstanceStore.getAllPastInstancesByClassroom(
          //   classroomId
          // ),
          // classroomActivityStore.getAllActivitiesByClassroom(classroomId),
        ]);
      }
    } catch (error) {
      console.error("Error loading classroom data:", error);
    }
  }, [classroomId]);

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
