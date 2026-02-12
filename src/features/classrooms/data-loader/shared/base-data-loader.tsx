"use client";

import { createContext, useContext, useEffect, useCallback } from "react";

import PageLoader from "@/components/shared/page-loader";
import { logger } from "@/lib/logger";

import type { ClassroomDataLoaderContextType, BaseClassroomDataLoaderProps } from "./types";

const log = logger.child({ module: "classrooms.data-loader.base" });

/**
 * Context for classroom data loader.
 * Do not use directly - use useClassroomDataLoader hook instead.
 */
const ClassroomDataLoaderContext = createContext<ClassroomDataLoaderContextType | undefined>(undefined);

/**
 * Base Classroom Data Loader Provider - Foundation component for all role-specific data loaders.
 *
 * Establishes the foundational data loading logic that all role-specific loaders
 * (Admin, Teacher, Student) extend from. Handles data fetching, loading states,
 * and provides a consistent refresh mechanism.
 *
 * **Core Responsibilities:**
 * - Executes role-specific data loading on mount
 * - Manages loading states across multiple stores
 * - Provides refresh functionality for manual data reload
 * - Shows loading screen during initial data fetch
 *
 * **Data Loading Flow:**
 * 1. Component mounts and validates classroomId
 * 2. Calls onLoadData() to fetch role-specific data
 * 3. Aggregates loading states from getLoadingState()
 * 4. Displays PageLoader while isLoading is true
 * 5. Renders children once data is loaded
 *
 * @param props - Configuration props
 * @param props.children - React children to render after data loads
 * @param props.classroomId - ID of the classroom to load data for
 * @param props.onLoadData - Async function to load role-specific data
 * @param props.getLoadingState - Function returning aggregated loading state
 * @returns JSX element with loading screen or children
 *
 * @example
 * ```tsx
 * // Admin role implementation
 * const loadAdminData = async (classroomId: string) => {
 *   await Promise.all([
 *     settingsStore.fetch(classroomId),
 *     projectsStore.fetch(classroomId),
 *   ]);
 * };
 *
 * const getAdminLoadingState = () => {
 *   return settingsStore.loading || projectsStore.loading;
 * };
 *
 * <BaseClassroomDataLoader
 *   classroomId="123"
 *   onLoadData={loadAdminData}
 *   getLoadingState={getAdminLoadingState}
 * >
 *   <ClassroomContent />
 * </BaseClassroomDataLoader>
 * ```
 *
 * @remarks
 * - **Loading States**: Shows PageLoader while any store is loading
 * - **Error Handling**: Logs errors but doesn't block rendering
 * - **Refresh**: Provides refreshData() to manually reload all data
 *
 * @throws No explicit error throwing. Logs errors if onLoadData fails.
 */
export function BaseClassroomDataLoader({
    children,
    classroomId,
    onLoadData,
    getLoadingState,
}: Readonly<BaseClassroomDataLoaderProps>) {
    const isLoading = getLoadingState();

    // Load data on mount or when classroomId changes
    useEffect(() => {
        if (!classroomId) {
            log.warn({ classroomId }, "Attempted to load data without classroomId");
            return;
        }

        const loadData = async () => {
            try {
                log.info({ classroomId }, "Loading classroom data");
                await onLoadData(classroomId);
                log.info({ classroomId }, "Classroom data loaded successfully");
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                log.error(
                    { err: error, classroomId, errorMessage },
                    "Error loading classroom data"
                );
            }
        };

        loadData();
    }, [classroomId]);

    /**
     * Manually refresh all classroom data.
     * Useful after mutations or when data needs to be reloaded.
     */
    const refreshData = useCallback(async () => {
        if (!classroomId) {
            log.warn({ classroomId }, "Attempted to refresh data without classroomId");
            return;
        }

        try {
            log.info({ classroomId }, "Manually refreshing classroom data");
            await onLoadData(classroomId);
            log.info({ classroomId }, "Classroom data refreshed successfully");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            log.error(
                { err: error, classroomId, errorMessage },
                "Error refreshing classroom data"
            );
        }
    }, [classroomId, onLoadData]);

    const contextValue: ClassroomDataLoaderContextType = {
        isLoading,
        classroomId,
        refreshData,
    };

    // Show loading screen while data is being fetched
    if (isLoading) {
        return <PageLoader />;
    }

    return <ClassroomDataLoaderContext value={contextValue}>{children}</ClassroomDataLoaderContext>;
}

/**
 * Hook to access classroom data loader context.
 * Provides loading state, classroom ID, and refresh functionality.
 *
 * @throws Error if used outside ClassroomDataLoaderProvider
 *
 * @returns Context value with isLoading, classroomId, and refreshData
 *
 * @example
 * ```tsx
 * function ClassroomContent() {
 *   const { classroomId, refreshData, isLoading } = useClassroomDataLoader();
 *
 *   const handleRefresh = () => {
 *     refreshData();
 *   };
 *
 *   return <div>Classroom: {classroomId}</div>;
 * }
 * ```
 */
export function useClassroomDataLoader(): ClassroomDataLoaderContextType {
    const context = useContext(ClassroomDataLoaderContext);
    
    if (context === undefined) {
        throw new Error("useClassroomDataLoader must be used within a ClassroomDataLoaderProvider");
    }

    return context;
}
