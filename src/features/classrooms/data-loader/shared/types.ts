import type { ReactNode } from "react";

/**
 * Context value type for ClassroomDataLoader.
 * Provides loading state, classroom ID, and data refresh capability.
 */
export interface ClassroomDataLoaderContextType {
    readonly isLoading: boolean;
    readonly classroomId: string;
    readonly refreshData: () => Promise<void>;
}

/**
 * Props for BaseClassroomDataLoader component.
 */
export interface BaseClassroomDataLoaderProps {
    readonly children: ReactNode;
    readonly classroomId: string;
    readonly onLoadData: (classroomId: string) => Promise<void>;
    readonly getLoadingState: () => boolean;
}

/**
 * Props for role-specific ClassroomDataLoader components.
 */
export interface ClassroomDataLoaderProps {
    readonly children: ReactNode;
    readonly classroomId: string;
}
