"use client";

import { createContext, useContext, useEffect, useState } from "react";
import PageLoader from "@/components/shared/page-loader";
import AppBar from "@/components/shared/app-bar";
import { AppSidebar } from "@/components/shared/sidebar";

import { ClassroomT, SidebarDataT, Role} from "@/types";
import pathLabels from "@/utils/path-labels";

import { useAuth } from "@/features/shared/auth";
import { createSidebarConfig } from "./sidebar-config-factory";
import { generatePathLabelsByFeaturesData } from "../utils";
import NoAccessPage from "@/components/shared/empty-states/no-access-page";

/**
 * Props for the BaseStackProvider component.
 * Provides configuration options for role-specific behavior and data loading.
 */
interface BaseStackProviderProps {
    /** React children to render within the provider */
    readonly children: React.ReactNode;
    /** Array of roles allowed to access this provider */
    readonly allowedRoles: Role[];
    /** Whether to load initial data on mount */
    readonly loadInitialData?: boolean;
    /** Async function to load role-specific initial data */
    readonly onLoadData?: () => Promise<void>;
    /** Function to generate features data for path labels */
    readonly getFeaturesData?: () => { [key: string]: Map<string, string> };
    /** Optional array of classrooms for roles that require them */
    readonly classrooms?: ClassroomT[];
}

/**
 * Base context for stack providers.
 * Currently empty but can be extended for shared state management.
 */
const BaseStackContext = createContext({});

/**
 * Base Stack Provider component that provides common functionality for all role-specific providers.
 * Handles authentication, loading states, sidebar configuration, and layout rendering.
 * 
 * @param props - Configuration props for the provider
 * @returns JSX element with sidebar, app bar, and children
 * 
 * @example
 * ```typescript
 * <BaseStackProvider
 *   allowedRoles={["admin"]}
 *   loadInitialData={true}
 *   onLoadData={handleLoadData}
 *   getFeaturesData={getFeaturesData}
 *   classrooms={classrooms}
 * >
 *   {children}
 * </BaseStackProvider>
 * ```
 */
export const BaseStackProvider = ({ 
    children, 
    allowedRoles, 
    loadInitialData = true,
    onLoadData,
    getFeaturesData,
    classrooms
}: BaseStackProviderProps) => {
    const [loading, setLoading] = useState(false);
    const { user, userRole } = useAuth();

    /**
     * Effect to load initial data when component mounts or dependencies change.
     * Only executes if user is authenticated and has appropriate role.
     */
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!loadInitialData || !user || !userRole || !allowedRoles.includes(userRole)) return;
            if (!onLoadData) return;

            setLoading(true);
            try {
                await onLoadData();
            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Show no access screen for unauthorized users
    if (!user || !userRole || !allowedRoles.includes(userRole)) {
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
    const sidebarData: SidebarDataT = createSidebarConfig(user, userRole, classrooms);

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
            <div className="relative flex flex-col bg-background shadow ml-1 rounded-lg! w-full h-full overflow-hidden">
                <AppBar pathLabels={pathLabelsWithFeatures} />
                <div className="flex flex-col gap-10 w-full h-full overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    );
};

/**
 * Hook to access the base stack context.
 * Currently returns empty object but can be extended for shared state.
 * 
 * @returns Base stack context value
 */
export const useBaseStackContext = () => useContext(BaseStackContext);