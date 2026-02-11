"use client";

import { SidebarData } from "@/components/shared/sidebar/types";
import { Role } from "@/features/auth/access-control/types";
import { Classroom } from "@/features/classrooms/types";

import { generateSidebarConfig as generateAdminConfig } from "../roles/admin/sidebar-config";
import { generateSidebarConfig as generateEmployerConfig } from "../roles/employer/sidebar-config";
import { generateSidebarConfig as generateStudentConfig } from "../roles/student/sidebar-config";
import { Profile } from "@/features/users/profile/types/profile";

/**
 * Factory interface for generating sidebar configuration data for a given user context.
 *
 * Implementations receive the authenticated user profile and an optional list
 * of classrooms, and must return a fully constructed {@link SidebarData}
 * describing the navigation for that user and role.
 *
 * @param userProfile - The profile of the authenticated user for whom the sidebar is being generated.
 * @param classrooms - Optional list of classrooms associated with the user; used by roles whose sidebar is classroom-aware.
 * @returns A {@link SidebarData} instance representing the sidebar configuration for the provided context.
 */
interface SidebarConfigGenerator {
    (userProfile: Profile, classrooms?: Classroom[]): SidebarData;
}
interface CreateSidebarConfigParams {
    userProfile: Profile;
    userRole: Role;
    classrooms?: Classroom[];
}

/**
 * Role-to-generator mapping with wrapper functions to normalize different signatures.
 *
 * **Role-Specific Sidebar Configurations:**
 * - **admin**: Full system access with management dashboards, classroom oversight, user management
 * - **class_manager**: Student journey management interface, class coordination focus
 * - **employer**: Job posting and recruitment interface, simplified navigation
 * - **teacher**: Facilitator interface for classroom management and student assessment
 * - **student**: Classroom-based learning interface, course materials and assignments access
 * - **alumni**: Limited access for graduated students, historical data access only
 * - **guest**: Minimal configuration for unauthenticated or unauthorized users
 *
 * @type {Record<Role, SidebarConfigGenerator>}
 */
const SIDEBAR_CONFIG_GENERATORS: Record<Role, SidebarConfigGenerator> = {
    admin: (userProfile, classrooms) => generateAdminConfig(userProfile, classrooms || []),
    class_manager: (userProfile) => ({
        userProfile,
        team: { name: "Jornada de Estudantes", logo: () => null },
        navMain: [],
        projects: [],
    }),
    employer: (userProfile) => generateEmployerConfig(userProfile),
    teacher: (userProfile) => ({ userProfile, team: { name: "Facilitador", logo: () => null }, navMain: [], projects: [] }),
    student: (userProfile, classrooms) => generateStudentConfig(userProfile, classrooms || []),
    alumni: (userProfile) => ({ userProfile, team: { name: "Alumni", logo: () => null }, navMain: [], projects: [] }),
    guest: () => ({
        userProfile: {} as Profile,
        team: { name: "Guest", logo: () => null },
        navMain: [],
        projects: [],
    }),
};

/**
 * Factory function that creates sidebar configuration based on user role.
 *
 * Provides centralized, type-safe role-based sidebar generation with fallback handling
 * for unknown roles. Delegates to role-specific generator functions that define
 * navigation items, accessible projects, and team information.
 *
 * **Design Pattern:** Factory Pattern
 * - Abstracts role-specific implementation details
 * - Provides single point of access for sidebar configuration
 * - Enables easy addition of new roles without modifying core logic
 * - Includes sensible fallback for unknown roles
 *
 * **Role Requirements:**
 * - **Roles requiring classrooms**: admin, student, teacher, class_manager
 * - **Roles with minimal config**: employer, alumni, guest
 *
 * @param userProfile - Authenticated user profile containing user identification and metadata
 * @param userRole - User's role determining sidebar structure, navigation items, and permissions
 * @param classrooms - Optional array of Classroom objects (automatically used based on role requirements)
 * @returns Complete SidebarData configuration ready for AppSidebar component rendering
 *
 * @example
 * ```typescript
 * // Admin with full classroom access
 * const adminSidebar = createSidebarConfig(userProfile, 'admin', classrooms);
 *
 * // Employer with minimal configuration
 * const employerSidebar = createSidebarConfig(userProfile, 'employer');
 *
 * // Fallback for unknown role
 * const unknownSidebar = createSidebarConfig(userProfile, 'unknown_role' as Role);
 * // Returns guest configuration with warning logged
 * ```
 *
 * @remarks
 * - **Logging**: Logs warning to console if role has no matching generator
 * - **Fallback**: Falls back to guest configuration for unknown roles
 * - **Type Safety**: Ensures returned config always matches SidebarData interface
 * - **Classroom Optimization**: Pass classrooms only for roles that require them to avoid unnecessary data passing
 *
 * @throws No explicit error throwing. Logs warning and returns guest config for unknown roles.
 *
 * @see {@link SIDEBAR_CONFIG_GENERATORS} Role-specific generator mapping
 * @see {@link roleRequiresClassrooms} Helper function to check if role needs classroom data
 * @see {@link generateAdminConfig} Admin role configuration generator
 * @see {@link generateEmployerConfig} Employer role configuration generator
 * @see {@link generateStudentConfig} Student role configuration generator
 */
export const createSidebarConfig = ({ userProfile, userRole, classrooms }: CreateSidebarConfigParams): SidebarData => {
    const generator = SIDEBAR_CONFIG_GENERATORS[userRole];

    if (!generator) {
        console.warn(`No sidebar config generator found for role: ${userRole}`);
        return SIDEBAR_CONFIG_GENERATORS.guest(userProfile);
    }

    return generator(userProfile, classrooms);
};

/**
 * Utility function to determine if a role requires classroom data for sidebar configuration.
 *
 * Used for optimizing data loading strategies and determining which roles need classroom
 * context to render complete navigation and access features.
 *
 * **Roles Requiring Classrooms:**
 * - **admin**: Manages multiple classrooms and student oversight
 * - **student**: Accesses classroom-specific learning materials and assignments
 * - **teacher**: Facilitates classroom activities and student engagement
 * - **class_manager**: Coordinates student learning journeys across classrooms
 *
 * **Roles Not Requiring Classrooms:**
 * - **employer**: Job-focused interface independent of classrooms
 * - **alumni**: Historical access without classroom participation
 * - **guest**: Minimal configuration
 *
 * @param role - User role to check
 * @returns True if the role requires classroom data for complete functionality, false otherwise
 *
 * @example
 * ```typescript
 * // Optimized data loading based on role
 * if (roleRequiresClassrooms(userRole)) {
 *   const classrooms = await fetchUserClassrooms(userId);
 *   const sidebarConfig = createSidebarConfig(profile, userRole, classrooms);
 * } else {
 *   const sidebarConfig = createSidebarConfig(profile, userRole);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Data prefetching strategy
 * const needsClassrooms = roleRequiresClassrooms(userRole);
 * if (needsClassrooms) {
 *   prefetchClassrooms();
 * }
 * ```
 *
 * @remarks
 * - **Performance**: Use this function to avoid unnecessary classroom data loading
 * - **Memory**: Helps optimize memory usage by preventing unused data fetching
 * - **Type Safe**: Works with the Role type for compile-time safety
 * - **Extensible**: Easy to extend if new roles are added that require classrooms
 *
 * @throws No error throwing. Returns false for unknown roles as safe default.
 *
 * @see {@link createSidebarConfig} Uses this function for optimal data loading
 * @see {@link BaseStackProvider} Parent component that calls this function
 */
export const roleRequiresClassrooms = (role: Role): boolean => {
    return ["admin", "student", "teacher", "class_manager"].includes(role);
};
