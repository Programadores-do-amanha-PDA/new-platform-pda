"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";

import { useAuth } from "@/features/shared/auth";
import PageLoader from "@/components/shared/page-loader";
import { useActivityStore } from "@/features/dashboard/classrooms/classroom/activities";
import {
    useZoomAccountStore,
    useZoomMeetingStore,
    useZoomMeetingPastInstanceStore,
} from "@/features/dashboard/classrooms/classroom/integrations/zoom/stores";
import { useCoodeshAssessmentStore } from "@/features/dashboard/classrooms/classroom/integrations/coodesh/stores/assessments";
import { useClassroomSettingStore } from "@/features/dashboard/classrooms/classroom/settings";
import { useClassroomProjectStore } from "@/features/dashboard/classrooms/classroom/projects/stores";
import { useClassroomProjectCorrectionsStore } from "@/features/dashboard/classrooms/classroom/projects/stores/corrections";
import { useClassroomProjectDeliveriesStore } from "@/features/dashboard/classrooms/classroom/projects/stores/deliveries";
import { useParams } from "next/navigation";
import { useClassroomStore } from "@/features/dashboard/classrooms/home-page/store";

interface ClassroomDataLoaderContextType {
    isLoading: boolean;
    classroomId: string;
    refreshData: () => Promise<void>;
}
const ClassroomDataLoaderContext = createContext<ClassroomDataLoaderContextType | undefined>(undefined);
interface ClassroomDataLoaderProviderProps {
    children: ReactNode;
}

export function ClassroomDataLoaderProvider({ children }: ClassroomDataLoaderProviderProps) {
    const { classroom_id: classroomId } = useParams<{ classroom_id: string }>();

    if (!classroomId) {
        throw new Error("ClassroomDataLoaderProvider requires a classroom_id route param");
    }
    const classroomStore = useClassroomStore();
    const coodeshAssessmentStore = useCoodeshAssessmentStore();
    const projectStore = useClassroomProjectStore();
    const deliveryStore = useClassroomProjectDeliveriesStore();
    const correctionStore = useClassroomProjectCorrectionsStore();
    const zoomAccountStore = useZoomAccountStore();
    const zoomMeetingStore = useZoomMeetingStore();
    const zoomMeetingPastInstanceStore = useZoomMeetingPastInstanceStore();
    const classroomActivityStore = useActivityStore();
    const classroomConfigStore = useClassroomSettingStore();
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

    const loadAllData = async () => {
        if (!classroomId) return;

        try {
            if (userRole === "teacher" || userRole === "admin") {
                await Promise.all([
                    classroomConfigStore.fetchSettingByClassroomId({ classroomId }),
                    coodeshAssessmentStore.getAllAssessmentsByClassroomId(classroomId),
                    projectStore.getAllProjectsByClassroomId(classroomId),
                    deliveryStore.getAllDeliveriesByClassroomId(classroomId),
                    correctionStore.getAllCorrectionsByClassroomId(classroomId),
                    zoomAccountStore.getAllAccounts(classroomId),
                    zoomMeetingStore.getAllMeetings(classroomId),
                    zoomMeetingPastInstanceStore.getAllPastInstancesByClassroom(classroomId),
                    classroomActivityStore.fetchAllActivitiesByClassroom({ classroomId }),
                ]);
            } else {
                await Promise.all([
                    classroomConfigStore.fetchSettingByClassroomId({ classroomId }),
                    projectStore.getAllProjectsByClassroomId(classroomId),
                    deliveryStore.getAllDeliveriesByClassroomId(classroomId),
                    correctionStore.getAllCorrectionsByClassroomId(classroomId),
                ]);
            }
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

    if (isLoading) {
        return <PageLoader />;
    }

    return <ClassroomDataLoaderContext.Provider value={contextValue}>{children}</ClassroomDataLoaderContext.Provider>;
}

export function useClassroomDataLoader() {
    const context = useContext(ClassroomDataLoaderContext);

    if (context === undefined || context.isLoading) {
        return <PageLoader />;
    }

    return context;
}
