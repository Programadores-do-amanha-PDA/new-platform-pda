"use client";

import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { useUsersStore } from "@/features/users/management";
import { useCoodeshAssessmentStore } from "@/features/classroom-coodesh/stores/assessments";
import { useClassroomStore } from "@/features/classrooms/list/store";
import { RolesLabels } from "@/features/auth/access-control/types";
import { useClassroomProjectStore } from "@/features/classroom-projects/stores";
import { BaseStackProvider } from "../../shared/base-stack-provider";
import { useZoomMeetingStore } from "@/features/classroom-zoom/stores/meetings";

interface AdminStackProviderProps {
    readonly children: React.ReactNode;
    readonly loadInitialData?: boolean;
}

/**
 * Admin Stack Provider - Role-specific provider for administrators.
 * 
 * Extends BaseStackProvider with admin-specific data loading and feature initialization.
 * Loads all system-wide data including classrooms, projects, assessments, zoom meetings,
 * users, and enrollments to provide comprehensive management interface.
 * 
 * **Loaded Data:**
 * - **Classrooms**: All classrooms with full details
 * - **Users**: All users with complete profiles
 * - **Enrollments**: All student enrollments across system
 * - **Projects**: Classroom projects with descriptions
 * - **Assessments**: Coodesh-based assessments and evaluations
 * - **Zoom Meetings**: Zoom integration data for virtual classrooms
 * 
 * **Features Provided:**
 * - Full classroom management and oversight
 * - User and profile administration
 * - Enrollment tracking and management
 * - Project and assessment oversight
 * - Zoom meeting integration for virtual classes
 * - Complete system analytics and reporting
 * 
 * **Sidebar Configuration:**
 * - Full navigation menu with all admin features
 * - Classroom selector for multi-classroom management
 * - Project and assessment management sections
 * - User management and enrollment controls
 * - System settings and configuration options
 * 
 * **Authorization:**
 * - Only accessible to users with 'admin' role
 * - Non-admin users see no-access page
 * 
 * @param props - Component props
 * @param props.children - React children to render within admin layout
 * @param props.loadInitialData - Whether to load all initial data (default: true)
 * @returns JSX element with admin-specific layout and features
 * 
 * @example
 * ```typescript
 * // Wrap admin dashboard with admin-specific provider
 * function AdminDashboard() {
 *   return (
 *     <AdminStackProvider loadInitialData={true}>
 *       <AdminContent />
 *     </AdminStackProvider>
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Skip initial data loading if already loaded elsewhere
 * function AdminSettings() {
 *   return (
 *     <AdminStackProvider loadInitialData={false}>
 *       <SettingsPage />
 *     </AdminStackProvider>
 *   );
 * }
 * ```
 * 
 * @remarks
 * - **Data Loading**: All admin data loaded in parallel for performance
 * - **Stores Used**: 
 *   - useClassroomStore: Classrooms and classroom operations
 *   - useClassroomProjectStore: Projects within classrooms
 *   - useCoodeshAssessmentStore: Assessment data
 *   - useZoomMeetingStore: Zoom meeting integration
 *   - useUsersStore: User profiles and management
 *   - useEnrollmentsManagementStore: Enrollment tracking
 * - **Features Data**: Maps store data to sidebar labels for breadcrumb navigation
 * - **Performance**: Parallel loading reduces total data fetch time
 * 
 * @throws No explicit error throwing. Handles store loading errors gracefully.
 * 
 * @see {@link BaseStackProvider} Parent provider with core functionality
 * @see {@link RolesLabels} Role type definitions
 * @see {@link useClassroomStore} Classroom data management store
 * @see {@link useUsersStore} User management store
 */
export const AdminStackProvider = ({ children, loadInitialData = true }: AdminStackProviderProps) => {
    const classroomStore = useClassroomStore();
    const projectStore = useClassroomProjectStore();
    const coodeshAssessmentStore = useCoodeshAssessmentStore();
    const zoomMeetingStore = useZoomMeetingStore();
    const usersStore = useUsersStore();
    const enrollmentsStore = useEnrollmentsManagementStore();

    const handleLoadData = async () => {
        await Promise.all([
            classroomStore.getAllClassroomsAsync(),
            usersStore.fetchAllUsersWithProfiles({}),
            enrollmentsStore.fetchAllEnrollments(),
        ]);
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
            allowedRoles={[RolesLabels.ADMIN]}
            loadInitialData={loadInitialData}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
            classrooms={classroomStore.classrooms}
        >
            {children}
        </BaseStackProvider>
    );
};
