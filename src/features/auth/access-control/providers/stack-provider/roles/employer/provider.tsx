"use client";

import { useUsersStore } from "@/features/users/management";
import { BaseStackProvider } from "../../shared/base-stack-provider";
import { RolesLabels } from "@/features/auth/access-control/types";

interface EmployerStackProviderProps {
    readonly children: React.ReactNode;
    readonly loadInitialData?: boolean;
}

/**
 * Employer Stack Provider - Role-specific provider for employers and recruiters.
 *
 * Extends BaseStackProvider with employer-specific data loading and feature initialization.
 * Provides a recruitment-focused interface with job posting, candidate management,
 * and hiring workflow features.
 *
 * **Loaded Data:**
 * - **Users**: All users for candidate sourcing and collaboration
 * - **Jobs**: Employer's active and archived job postings
 * - **Applications**: Candidate applications for posted positions
 * - **Candidates**: Candidate profiles and resumes
 *
 * **Features Provided:**
 * - Create and manage job postings
 * - Review candidate applications
 * - Track hiring pipeline and workflow
 * - Candidate profile browsing and filtering
 * - Resume review and screening
 * - Communication with candidates
 * - Analytics and reporting on job performance
 *
 * **Sidebar Configuration:**
 * - Employer-focused navigation menu
 * - Jobs management section
 * - Applications and candidates tracking
 * - Analytics and recruiting metrics
 * - Company profile and settings
 * - Team member management
 *
 * **Authorization:**
 * - Only accessible to users with 'employer' role
 * - Employers can only see their own postings and applications
 * - Limited to employer-specific recruitment features
 *
 * **Data Loading Strategy:**
 * - Minimal initial data loading for faster page load
 * - User profiles loaded for candidate interaction
 * - Job and application data loaded on demand
 * - Lazy loading of analytics and reporting
 *
 * @param props - Component props
 * @param props.children - React children to render within employer layout
 * @param props.loadInitialData - Whether to load initial employer data (default: true)
 * @returns JSX element with employer-specific layout and features
 *
 * @example
 * ```typescript
 * // Wrap employer dashboard with employer-specific provider
 * function EmployerDashboard() {
 *   return (
 *     <EmployerStackProvider loadInitialData={true}>
 *       <EmployerContent />
 *     </EmployerStackProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Skip initial data loading for specific workflows
 * function JobPostingForm() {
 *   return (
 *     <EmployerStackProvider loadInitialData={false}>
 *       <PostingForm />
 *     </EmployerStackProvider>
 *   );
 * }
 * ```
 *
 * @remarks
 * - **Data Loading**: Optimized for employer-specific minimal requirements
 * - **Stores Used**:
 *   - useUsersStore: Candidate profiles and user management
 * - **Features Data**: Currently empty - employer features use dedicated data loading
 * - **Simplified**: Compared to admin/student providers, employer provider is minimal
 * - **Scalability**: Can be extended with job posting, application, and analytics stores
 * - **Performance**: Fast loading with minimal initial data fetching
 *
 * @throws No explicit error throwing. Handles store loading errors gracefully.
 *
 * @see {@link BaseStackProvider} Parent provider with core functionality
 * @see {@link AdminStackProvider} Similar provider for admin role (more complex)
 * @see {@link StudentStackProvider} Similar provider for student role
 * @see {@link RolesLabels} Role type definitions
 * @see {@link useUsersStore} User management store
 */
export const EmployerStackProvider = ({ children, loadInitialData = true }: EmployerStackProviderProps) => {
    const usersStore = useUsersStore();

    const handleLoadData = async () => {
        await Promise.all([usersStore.fetchAllUsersWithProfiles({})]);
    };

    const getFeaturesData = () => ({});

    return (
        <BaseStackProvider
            allowedRoles={[RolesLabels.EMPLOYER]}
            loadInitialData={loadInitialData}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
        >
            {children}
        </BaseStackProvider>
    );
};
