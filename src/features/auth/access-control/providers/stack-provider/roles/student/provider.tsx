"use client";

import { useUsersStore } from "@/features/users/management";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { useCoodeshAssessmentStore } from "@/features/classroom-coodesh/stores/assessments";
import { useClassroomStore } from "@/features/classrooms/list/store";
import { RolesLabels } from "@/features/auth/access-control/types";
import { useClassroomProjectStore } from "@/features/classroom-projects/stores";
import { useZoomMeetingStore } from "@/features/classroom-zoom/stores";

import { BaseStackProvider } from "../../shared/base-stack-provider";

interface StudentStackProviderProps {
    readonly children: React.ReactNode;
    readonly loadInitialData?: boolean;
}

/**
 * Student Stack Provider - Role-specific provider for students.
 * 
 * Extends BaseStackProvider with student-specific data loading and feature initialization.
 * Provides a learning-focused interface with access to classrooms, projects, assignments,
 * and other course materials restricted to student's enrollments.
 * 
 * **Loaded Data:**
 * - **Users**: All users for classroom interaction (limited to visible profiles)
 * - **Classrooms**: Classrooms student is enrolled in
 * - **Projects**: Projects within student's classrooms
 * - **Assessments**: Coodesh assessments and coding challenges
 * - **Zoom Meetings**: Virtual classroom meetings for assigned classes
 * - **Enrollments**: Student's own enrollments and course information
 * 
 * **Features Provided:**
 * - Access to enrolled classrooms and course materials
 * - View project assignments and submissions
 * - Complete assessments and coding challenges
 * - Join Zoom meetings for virtual classes
 * - Track learning progress and grades
 * - Collaborate with classmates (if enabled)
 * 
 * **Sidebar Configuration:**
 * - Student-focused navigation menu
 * - My Classrooms section showing enrolled courses
 * - My Projects with assignment status
 * - My Assessments with scoring information
 * - My Zoom Meetings calendar
 * - Learning progress tracking
 * 
 * **Authorization:**
 * - Only accessible to users with 'student' role
 * - Students can only see their enrolled courses
 * - Limited to student-specific features and content
 * 
 * @param props - Component props
 * @param props.children - React children to render within student layout
 * @param props.loadInitialData - Whether to load initial student data (default: true)
 * @returns JSX element with student-specific layout and features
 * 
 * @example
 * ```typescript
 * // Wrap student dashboard with student-specific provider
 * function StudentDashboard() {
 *   return (
 *     <StudentStackProvider loadInitialData={true}>
 *       <StudentContent />
 *     </StudentStackProvider>
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Skip initial data loading if already loaded elsewhere
 * function StudentClassroom() {
 *   return (
 *     <StudentStackProvider loadInitialData={false}>
 *       <ClassroomView />
 *     </StudentStackProvider>
 *   );
 * }
 * ```
 * 
 * @remarks
 * - **Data Loading**: Optimized for student-level data requirements
 * - **Stores Used**: 
 *   - useUsersStore: Other users for collaboration
 *   - useClassroomStore: Student's enrolled classrooms
 *   - useClassroomProjectStore: Project information
 *   - useCoodeshAssessmentStore: Assessment and challenge data
 *   - useZoomMeetingStore: Virtual meeting integration
 *   - useEnrollmentsManagementStore: Student's enrollment tracking
 * - **Features Data**: Maps store data to sidebar labels for breadcrumb navigation
 * - **Privacy**: Students only see content they're enrolled in
 * - **Performance**: Minimal data loading compared to admin for faster page loads
 * 
 * @throws No explicit error throwing. Handles store loading errors gracefully.
 * 
 * @see {@link BaseStackProvider} Parent provider with core functionality
 * @see {@link AdminStackProvider} Similar provider for admin role
 * @see {@link RolesLabels} Role type definitions
 * @see {@link useClassroomStore} Classroom data management store
 */
export const StudentStackProvider = ({ children, loadInitialData = true }: StudentStackProviderProps) => {
    const usersStore = useUsersStore();
    const classroomStore = useClassroomStore();
    const projectStore = useClassroomProjectStore();
    const coodeshAssessmentStore = useCoodeshAssessmentStore();
    const zoomMeetingStore = useZoomMeetingStore();
    const enrollmentsStore = useEnrollmentsManagementStore();

    const handleLoadData = async () => {
        await Promise.all([usersStore.fetchAllUsersWithProfiles({})]);
    };

    const getFeaturesData = () => ({
        classrooms: new Map(classroomStore.classrooms.map((classroom) => [classroom.id, classroom.name])),
        projects: new Map(projectStore.projects.map((project) => [project.id, project.title])),
        coodeshAssessments: new Map(
            coodeshAssessmentStore.assessments.map((assessment) => [assessment.assessment_id, assessment.name]),
        ),
        zoomMeetings: new Map(zoomMeetingStore.meetings.map((meeting) => [meeting.id, meeting.topic])),
        enrollments: new Map(
            Object.values(enrollmentsStore.enrollmentsByUserId)
                .flat()
                .map((enrollment) => [enrollment.short_id, enrollment.short_id]),
        ),
    });

    return (
        <BaseStackProvider
            allowedRoles={[RolesLabels.STUDENT]}
            loadInitialData={loadInitialData}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
            classrooms={classroomStore.classrooms}
        >
            {children}
        </BaseStackProvider>
    );
};
