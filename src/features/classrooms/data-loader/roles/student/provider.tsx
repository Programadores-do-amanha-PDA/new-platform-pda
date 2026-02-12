"use client";

import { useClassroomProjectStore } from "@/features/classroom-projects/stores";
import { useClassroomProjectDeliveriesStore } from "@/features/classroom-projects/stores/deliveries";
import { useClassroomProjectCorrectionsStore } from "@/features/classroom-projects/stores/corrections";
import { useClassroomSettingStore } from "@/features/classrooms/settings/store";

import { BaseClassroomDataLoader } from "../../shared/base-data-loader";
import type { ClassroomDataLoaderProps } from "../../shared/types";

/**
 * Student Classroom Data Loader - Role-specific data loader for students.
 *
 * Extends BaseClassroomDataLoader with student-specific data loading.
 * Loads limited classroom data focused on learning materials, assignments,
 * and student-relevant information.
 *
 * **Loaded Data:**
 * - **Classroom Settings**: Basic configuration and available modules
 * - **Projects**: Classroom projects and assignments
 * - **Deliveries**: Student's project submissions
 * - **Corrections**: Feedback and corrections on deliveries
 *
 * **NOT Loaded (Student Restrictions):**
 * - Coodesh Assessments (admin/teacher only)
 * - Zoom Accounts (admin/teacher only)
 * - Zoom Meetings (admin/teacher only)
 * - Zoom Past Instances (admin/teacher only)
 * - Classroom Activities (admin/teacher only)
 *
 * **Use Cases:**
 * - Student learning dashboard
 * - Assignment viewing and submission
 * - Grade and feedback review
 * - Personal progress tracking
 *
 * @param props - Component props
 * @param props.children - React children to render after data loads
 * @param props.classroomId - ID of the classroom to load data for
 * @returns JSX element with loading screen or children
 *
 * @example
 * ```tsx
 * <StudentClassroomDataLoader classroomId={classroomId}>
 *   <StudentDashboard />
 * </StudentClassroomDataLoader>
 * ```
 *
 * @remarks
 * - Only accessible to student users
 * - Loads limited data for student-focused features
 * - Optimized for faster loading with fewer API calls
 * - Suitable for student learning interfaces
 */
export function StudentClassroomDataLoader({ children, classroomId }: Readonly<ClassroomDataLoaderProps>) {
    const projectStore = useClassroomProjectStore();
    const deliveryStore = useClassroomProjectDeliveriesStore();
    const correctionStore = useClassroomProjectCorrectionsStore();
    const classroomSettingStore = useClassroomSettingStore();

    /**
     * Load student-specific classroom data.
     * Fetches limited data set for student learning experience.
     */
    const loadStudentData = async (classroomId: string) => {
        await Promise.all([
            classroomSettingStore.fetchSettingByClassroomId({ classroomId }),
            projectStore.getAllProjectsByClassroomId(classroomId),
            deliveryStore.getAllDeliveriesByClassroomId(classroomId),
            correctionStore.getAllCorrectionsByClassroomId(classroomId),
        ]);
    };

    /**
     * Aggregate loading states from student-accessible stores.
     * Returns true if any store is currently loading.
     */
    const getLoadingState = () => {
        return (
            classroomSettingStore.loading ||
            projectStore.loading ||
            deliveryStore.loading ||
            correctionStore.loading
        );
    };

    return (
        <BaseClassroomDataLoader
            classroomId={classroomId}
            onLoadData={loadStudentData}
            getLoadingState={getLoadingState}
        >
            {children}
        </BaseClassroomDataLoader>
    );
}
