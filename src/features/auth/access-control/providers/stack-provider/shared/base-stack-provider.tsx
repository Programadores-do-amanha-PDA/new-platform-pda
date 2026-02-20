"use client";

import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/shared/sidebar";
import { SidebarData } from "@/components/shared/sidebar/types";
import PageLoader from "@/components/shared/page-loader";
import NoAccessPage from "@/components/shared/empty-states/no-access-page";

import pathLabels from "@/utils/path-labels";
import { useAuth } from "@/features/auth/shared";
import { Role } from "@/features/auth/access-control/types";
import { Classroom } from "@/features/classrooms/types";
import { usePermissionsStore } from "@/features/auth/access-control/stores/permissions-store/store";

import { createSidebarConfig } from "./sidebar-config-factory";
import { generatePathLabelsByFeaturesData } from "../utils/generate-path-labels";
import { useUserProfileStore } from "@/features/users/profile/store";
import { AppBar } from "@/components/shared/app-bar";

interface BaseStackProviderProps {
    readonly children: React.ReactNode;
    readonly allowedRoles: Role[];
    readonly loadInitialData?: boolean;
    readonly onLoadData?: () => Promise<void>;
    readonly getFeaturesData?: () => { [key: string]: Map<string, string> };
    readonly classrooms?: Classroom[];
}

/**
 * Base Stack Provider - Foundation component for all role-specific stack providers.
 *
 * Establishes the foundational layout and functionality that all role-specific providers
 * (Admin, Student, Employer) extend from. Handles authorization verification, data loading,
 * sidebar configuration, and common UI structure.
 *
 * **Core Responsibilities:**
 * - Verifies user authentication and validates allowed roles
 * - Loads role-specific data on component mount
 * - Generates role-appropriate sidebar configuration
 * - Provides layout structure with AppBar and AppSidebar
 * - Shows no-access page for unauthorized users
 *
 * **Layout Structure:**
 * ```
 * AppSidebar (left navigation)
 * └─ AppBar (top navigation with path labels)
 *    └─ Main Content Area (children)
 * ```
 *
 * **Data Loading Flow:**
 * 1. Component mounts and checks user authentication
 * 2. Validates user role against allowedRoles
 * 3. If authorized, calls onLoadData() to populate Zustand stores
 * 4. Generates sidebar configuration based on user role and classrooms
 * 5. Merges path labels with features data if getFeaturesData provided
 * 6. Renders layout with AppBar, AppSidebar, and children
 *
 * @param props - Configuration props
 * @param props.children - React children to render within the main content area
 * @param props.allowedRoles - Array of Role types authorized to access this provider
 * @param props.loadInitialData - Whether to load initial data on mount (default: true)
 * @param props.onLoadData - Async function to load role-specific data from stores/API
 * @param props.getFeaturesData - Function returning feature-specific path label mappings
 * @param props.classrooms - Array of Classroom objects needed for sidebar config
 * @returns JSX element with complete stack layout (sidebar, app bar, content)
 *
 * @example
 * ```typescript
 * // Admin role provider implementation
 * const AdminStackProvider = ({ children }: { children: React.ReactNode }) => {
 *   return (
 *     <BaseStackProvider
 *       allowedRoles={["admin"]}
 *       loadInitialData={true}
 *       onLoadData={loadAdminData}
 *       getFeaturesData={getAdminFeaturesData}
 *       classrooms={userClassrooms}
 *     >
 *       {children}
 *     </BaseStackProvider>
 *   );
 * };
 * ```
 *
 * @remarks
 * - **Authorization**: Renders NoAccessPage if user's role is not in allowedRoles
 * - **Loading States**: Shows PageLoader while loadInitialData is true and data is being fetched
 * - **Sidebar Factory**: Uses createSidebarConfig to generate role-specific navigation
 * - **Path Labels**: Merges default path labels with feature-specific data using generatePathLabelsByFeaturesData
 * - **Responsive**: Uses responsive Tailwind CSS classes for proper layout on different screen sizes
 *
 * @throws No explicit error throwing. Logs errors to console if onLoadData fails.
 *
 * @see {@link createSidebarConfig} Factory function for sidebar configuration
 * @see {@link generatePathLabelsByFeaturesData} Function for merging path labels with features data
 * @see {@link AdminStackProvider} Example role-specific provider implementation
 * @see {@link StudentStackProvider} Example role-specific provider implementation
 */
export const BaseStackProvider = ({
    children,
    allowedRoles,
    loadInitialData = true,
    onLoadData,
    getFeaturesData,
    classrooms,
}: BaseStackProviderProps) => {
    const [loading, setLoading] = useState(false);
    const { userRole } = useAuth();
    const { profile } = useUserProfileStore();
    const { fetchPermissionsForAllRoles } = usePermissionsStore();

    /**
     * Effect to load initial data when component mounts or dependencies change.
     * Only executes if user is authenticated and has appropriate role.
     * Also loads all role permissions from Supabase.
     */
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!loadInitialData || !profile || !userRole || !allowedRoles.includes(userRole)) return;

            setLoading(true);
            try {
                // Load permissions for all roles first, then other data in parallel
                await fetchPermissionsForAllRoles();
                
                if (onLoadData) {
                    await onLoadData();
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    // Show no access screen for unauthorized users
    if (!profile || !userRole || !allowedRoles.includes(userRole)) {
        return (
            <div className="flex justify-center items-center w-screen h-screen">
                <NoAccessPage />
            </div>
        );
    }

    // Show loading screen while initial data is being fetched
    if (loading && loadInitialData) {
        return <PageLoader />;
    }

    // Create sidebar configuration using the factory pattern
    const sidebarData: SidebarData = createSidebarConfig({ userProfile: profile, userRole, classrooms });

    // Generate path labels with features data if available
    const pathLabelsWithFeatures = getFeaturesData
        ? generatePathLabelsByFeaturesData({
              pathLabels,
              featuresData: getFeaturesData(),
          })
        : pathLabels;

    return (
        <>
            <AppSidebar data={sidebarData} />
            <div className="relative flex flex-col bg-background shadow ml-1 rounded-lg w-full h-full overflow-hidden">
                <AppBar pathLabels={pathLabelsWithFeatures} />
                <div className="flex flex-col gap-10 w-full h-full overflow-hidden">{children}</div>
            </div>
        </>
    );
};

/**
 * Hook to access the base stack context.
 * Currently returns empty object but designed for extension to support shared state access.
 *
 * Allows descendant components within a BaseStackProvider tree to access shared context
 * and state without prop drilling.
 *
 * **Usage:**
 * Typically used within role-specific providers to access and provide shared state
 * to all child components. Currently minimal but can be extended with:
 * - User profile information
 * - Current role and permissions
 * - Classroom data references
 * - Theme and UI preferences
 *
 * @returns Base stack context value (currently empty object)
 * @throws {Error} If used outside of a BaseStackProvider
 *
 * @example
 * ```typescript
 * // Inside a component wrapped by BaseStackProvider
 * function MyComponent() {
 *   const context = useBaseStackContext();
 *   // Access shared state here
 *   return <div>Content</div>;
 * }
 * ```
 *
 * @remarks
 * - Must be called from within a BaseStackProvider component tree
 * - Currently returns empty object, can be extended with TypeScript generics
 * - If used outside provider, will cause runtime error when trying to access properties
 *
 * @see {@link BaseStackProvider} Provider component
 */
