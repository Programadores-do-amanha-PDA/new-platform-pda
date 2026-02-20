"use client";

import { ReactNode, Suspense, lazy, useMemo } from "react";

import { AppSidebar } from "@/components/shared/sidebar";
import PageLoader from "@/components/shared/page-loader";
import NoAccessPage from "@/components/shared/empty-states/no-access-page";
import { useAuth } from "@/features/auth/shared";

import { generateNoAccessSidebarConfig } from "@/features/auth/access-control/providers/stack-provider/roles/no-access/sidebar-config";
import pathLabels from "@/utils/path-labels";
import { SidebarData } from "@/components/shared/sidebar/types";
import { useUserRoleStore } from "../../stores/user-role/user-role";
import { useUserProfileStore } from "@/features/users/profile/store";
import { AppBar } from "@/components/shared/app-bar";

/**
 * Stack providers mapped by role with lazy loading for performance.
 * Each role-specific provider is code-split and loaded only when accessed,
 * improving initial bundle size and application startup time.
 * 
 * Supported roles:
 * - `admin`: Full system access with management capabilities
 * - `employer`: Job and recruitment focused interface
 * - `student`: Learning and classroom focused interface
 */
const STACK_PROVIDERS_BY_ROLE = {
    admin: lazy(() => import("@/features/auth/access-control/providers/stack-provider/roles/admin/provider").then((mod) => ({ default: mod.AdminStackProvider }))),
    employer: lazy(() => import("@/features/auth/access-control/providers/stack-provider/roles/employer/provider").then((mod) => ({ default: mod.EmployerStackProvider }))),
    student: lazy(() => import("@/features/auth/access-control/providers/stack-provider/roles/student/provider").then((mod) => ({ default: mod.StudentStackProvider }))),
};

interface StackProviderProps {
    readonly children: ReactNode;
}

/**
 * Unified Stack Provider that orchestrates authentication, authorization, and role-specific UI rendering.
 * 
 * This component is the entry point for the application's role-based navigation and sidebar system.
 * It consolidates user authentication, role resolution, and dynamic provider selection for optimal
 * performance and maintainability.
 * 
 * **Features:**
 * - Lazy loads role-specific providers (code splitting) for improved performance
 * - Handles loading states during authentication and user profile fetching
 * - Provides fallback UI for unauthorized or unknown roles
 * - Manages sidebar and navigation configuration based on user role
 * - Resolves user role from both auth context and zustand store for reliability
 * 
 * **Role-Specific Behavior:**
 * - **Admin**: Full application access with management dashboards and controls
 * - **Student**: Classroom-focused interface with learning materials and assignments
 * - **Employer**: Job posting and recruitment interface
 * - **Unknown/No Access**: Displays no-access page with limited sidebar
 * 
 * @param props - Component props
 * @param props.children - React children to render within the role-specific layout
 * @returns JSX element with sidebar, app bar, and role-appropriate content
 * 
 * @example
 * ```typescript
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <Providers>
 *       <StackProvider>{children}</StackProvider>
 *     </Providers>
 *   );
 * }
 * ```
 * 
 * @remarks
 * - Requires `useAuth`, `useUserRoleStore`, and `useUserProfileStore` to be available in context
 * - Children are wrapped with role-specific providers that handle data loading
 * - A fallback `PageLoader` is displayed while role provider is being loaded
 * 
 * @throws Does not throw. Shows no-access UI for users without recognized roles.
 */
export const StackProvider = ({ children }: StackProviderProps) => {
    const { user, userRole } = useAuth();
    const { profile } = useUserProfileStore();
    const { userRole: userRoleData } = useUserRoleStore();

    // Memoize the actual role value to prevent unnecessary re-renders
    const resolvedRole = useMemo(() => {
        return typeof userRole === "string" ? userRole : userRoleData?.role;
    }, [userRole, userRoleData?.role]);

    // Show loading state while user data is being fetched
    if (!profile || !user) {
        return (
            <div className="flex justify-center items-center w-screen h-screen">
                <PageLoader />
            </div>
        );
    }

    // Get the appropriate stack provider component for the user's role
    const StackProviderComponentByRole = resolvedRole ? STACK_PROVIDERS_BY_ROLE[resolvedRole as keyof typeof STACK_PROVIDERS_BY_ROLE] : null;

    // If user has a recognized role, render with the role-specific stack provider
    if (StackProviderComponentByRole) {
        return (
            <Suspense fallback={<PageLoader />}>
                <StackProviderComponentByRole>{children}</StackProviderComponentByRole>
            </Suspense>
        );
    }

    // Fallback UI for users without recognized roles or access permissions
    const sidebarData: SidebarData = generateNoAccessSidebarConfig(profile, userRoleData);
    return (
        <>
            <AppSidebar data={sidebarData} />
            <div className="relative flex flex-col bg-background shadow ml-1 rounded-lg w-full h-full overflow-hidden">
                <AppBar pathLabels={pathLabels} />
                <div className="flex flex-col gap-10 w-full h-full overflow-hidden">
                    <NoAccessPage />
                </div>
            </div>
        </>
    );
};
