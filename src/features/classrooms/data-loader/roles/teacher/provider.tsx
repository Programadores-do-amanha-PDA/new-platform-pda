"use client";

import { useCoodeshAssessmentStore } from "@/features/classroom-coodesh/stores/assessments";
import { useZoomAccountStore } from "@/features/classroom-zoom/stores/accounts";
import { useZoomMeetingStore } from "@/features/classroom-zoom/stores/meetings";
import { useZoomMeetingPastInstanceStore } from "@/features/classroom-zoom/stores/past-instances";
import { useActivityStore } from "@/features/classroom-activities/store";
import { useClassroomProjectStore } from "@/features/classroom-projects/stores";
import { useClassroomProjectDeliveriesStore } from "@/features/classroom-projects/stores/deliveries";
import { useClassroomProjectCorrectionsStore } from "@/features/classroom-projects/stores/corrections";
import { useClassroomSettingStore } from "@/features/classrooms/settings/store";

import { BaseClassroomDataLoader } from "../../shared/base-data-loader";
import type { ClassroomDataLoaderProps } from "../../shared/types";

/**
 * Teacher Classroom Data Loader - Role-specific data loader for teachers.
 *
 * Extends BaseClassroomDataLoader with teacher-specific data loading.
 * Loads comprehensive classroom data including settings, projects, assessments,
 * Zoom integrations, and activities for classroom management and instruction.
 *
 * **Loaded Data:**
 * - **Classroom Settings**: Configuration and module settings
 * - **Coodesh Assessments**: All assessments for the classroom
 * - **Projects**: All classroom projects
 * - **Deliveries**: All student project deliveries
 * - **Corrections**: All delivery corrections and feedback
 * - **Zoom Accounts**: Zoom account configurations
 * - **Zoom Meetings**: Scheduled and past meetings
 * - **Zoom Past Instances**: Historical meeting data
 * - **Activities**: All classroom activities and assignments
 *
 * **Use Cases:**
 * - Classroom teaching dashboard
 * - Student progress tracking
 * - Assignment and project management
 * - Virtual classroom coordination
 *
 * @param props - Component props
 * @param props.children - React children to render after data loads
 * @param props.classroomId - ID of the classroom to load data for
 * @returns JSX element with loading screen or children
 *
 * @example
 * ```tsx
 * <TeacherClassroomDataLoader classroomId={classroomId}>
 *   <TeacherDashboard />
 * </TeacherClassroomDataLoader>
 * ```
 *
 * @remarks
 * - Only accessible to teacher users
 * - Loads complete classroom data for instruction
 * - Suitable for teaching and classroom management interfaces
 */
export function TeacherClassroomDataLoader({ children, classroomId }: Readonly<ClassroomDataLoaderProps>) {
    const coodeshAssessmentStore = useCoodeshAssessmentStore();
    const projectStore = useClassroomProjectStore();
    const deliveryStore = useClassroomProjectDeliveriesStore();
    const correctionStore = useClassroomProjectCorrectionsStore();
    const zoomAccountStore = useZoomAccountStore();
    const zoomMeetingStore = useZoomMeetingStore();
    const zoomMeetingPastInstanceStore = useZoomMeetingPastInstanceStore();
    const classroomActivityStore = useActivityStore();
    const classroomSettingStore = useClassroomSettingStore();

    /**
     * Load all teacher-specific classroom data.
     * Fetches comprehensive data set for teaching and classroom management.
     */
    const loadTeacherData = async (classroomId: string) => {
        await Promise.all([
            classroomSettingStore.fetchSettingByClassroomId({ classroomId }),
            coodeshAssessmentStore.getAllAssessmentsByClassroomId(classroomId),
            projectStore.getAllProjectsByClassroomId(classroomId),
            deliveryStore.getAllDeliveriesByClassroomId(classroomId),
            correctionStore.getAllCorrectionsByClassroomId(classroomId),
            zoomAccountStore.getAllAccounts(classroomId),
            zoomMeetingStore.getAllMeetings(classroomId),
            zoomMeetingPastInstanceStore.getAllPastInstancesByClassroom(classroomId),
            classroomActivityStore.fetchAllActivitiesByClassroom({ classroomId }),
        ]);
    };

    /**
     * Aggregate loading states from all stores.
     * Returns true if any store is currently loading.
     */
    const getLoadingState = () => {
        return (
            classroomSettingStore.loading ||
            coodeshAssessmentStore.loading ||
            projectStore.loading ||
            deliveryStore.loading ||
            correctionStore.loading ||
            zoomAccountStore.loading ||
            zoomMeetingStore.loading ||
            zoomMeetingPastInstanceStore.loading ||
            classroomActivityStore.loading
        );
    };

    return (
        <BaseClassroomDataLoader
            classroomId={classroomId}
            onLoadData={loadTeacherData}
            getLoadingState={getLoadingState}
        >
            {children}
        </BaseClassroomDataLoader>
    );
}
