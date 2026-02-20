"use client";

import { lazy, Suspense } from "react";

import PageLoader from "@/components/shared/page-loader";
import { useAuth } from "@/features/auth/shared";

import type { ClassroomDataLoaderProps } from "./shared/types";

/**
 * Data loaders mapped by role with lazy loading for performance.
 * Each role-specific loader is code-split and loaded only when accessed,
 * improving initial bundle size and reducing unnecessary data fetching.
 *
 * Supported roles:
 * - `admin`: Full classroom data access with all integrations
 * - `teacher`: Complete classroom data for teaching and management
 * - `student`: Limited classroom data for learning purposes
 */
const DATA_LOADERS_BY_ROLE = {
    admin: lazy(() =>
        import("./roles/admin/provider").then((mod) => ({
            default: mod.AdminClassroomDataLoader,
        }))
    ),
    teacher: lazy(() =>
        import("./roles/teacher/provider").then((mod) => ({
            default: mod.TeacherClassroomDataLoader,
        }))
    ),
    student: lazy(() =>
        import("./roles/student/provider").then((mod) => ({
            default: mod.StudentClassroomDataLoader,
        }))
    ),
} as const;

/**
 * Unified Classroom Data Loader Provider that orchestrates role-based data fetching.
 *
 * This component is the entry point for classroom-specific data loading.
 * It automatically selects and renders the appropriate data loader based on
 * the authenticated user's role, ensuring optimal performance and security.
 *
 * **Features:**
 * - Lazy loads role-specific data loaders (code splitting) for improved performance
 * - Handles loading states during authentication and data fetching
 * - Provides fallback for unknown roles
 * - Loads only role-appropriate data (students don't load admin data)
 * - Manages Zustand store population for classroom context
 *
 * **Role-Specific Data Loading:**
 * - **Admin**: All classroom data (settings, projects, deliveries, corrections,
 *   assessments, zoom, activities)
 * - **Teacher**: Same as admin - full classroom management data
 * - **Student**: Limited data (settings, projects, deliveries, corrections only)
 * - **Unknown/No Role**: Returns null (no data loaded)
 *
 * **Data Loaded into Stores:**
 * All roles:
 * - Classroom settings (modules, configuration)
 * - Classroom projects (assignments, descriptions)
 * - Project deliveries (student submissions)
 * - Delivery corrections (feedback, grades)
 *
 * Admin/Teacher only:
 * - Coodesh assessments
 * - Zoom accounts and meetings
 * - Zoom past instances
 * - Classroom activities
 *
 * @param props - Component props
 * @param props.classroomId - ID of the classroom to load data for
 * @param props.children - React children to render after data loads
 * @returns JSX element with appropriate data loader or null
 *
 * @example
 * ```tsx
 * // Wrap classroom pages with data loader
 * export default function ClassroomPage({ params }: { params: { id: string } }) {
 *   return (
 *     <ClassroomDataLoaderProvider classroomId={params.id}>
 *       <ClassroomDashboard />
 *     </ClassroomDataLoaderProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Use with multiple nested components
 * function ClassroomLayout({ classroomId }: { classroomId: string }) {
 *   return (
 *     <ClassroomDataLoaderProvider classroomId={classroomId}>
 *       <ClassroomHeader />
 *       <ClassroomContent />
 *       <ClassroomFooter />
 *     </ClassroomDataLoaderProvider>
 *   );
 * }
 * ```
 *
 * @remarks
 * - **Authentication Required**: User must be authenticated via useAuth()
 * - **Role Required**: Valid user role must be present
 * - **Lazy Loading**: Role-specific loaders are code-split for performance
 * - **Suspense Boundary**: Provides PageLoader during lazy component loading
 * - **Store Integration**: Automatically populates Zustand stores with classroom data
 * - **Security**: Students cannot access admin/teacher-only data
 *
 * @throws Does not throw. Returns null for users without recognized roles.
 */
export function ClassroomDataLoaderProvider({ children, classroomId }: Readonly<ClassroomDataLoaderProps>) {
    const { userRole } = useAuth();

    // Return null if no valid role
    if (!userRole || !(userRole in DATA_LOADERS_BY_ROLE)) {
        return null;
    }

    // Get the appropriate data loader for the user's role
    const DataLoaderComponent = DATA_LOADERS_BY_ROLE[userRole as keyof typeof DATA_LOADERS_BY_ROLE];

    return (
        <Suspense fallback={<PageLoader />}>
            <DataLoaderComponent classroomId={classroomId}>
                {children}
            </DataLoaderComponent>
        </Suspense>
    );
}

// Re-export the hook for convenience
export { useClassroomDataLoader } from "./shared/base-data-loader";
