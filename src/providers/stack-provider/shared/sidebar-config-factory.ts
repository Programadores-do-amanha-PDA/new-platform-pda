/**
 * Factory pattern for creating sidebar configurations based on user roles.
 * Centralizes common logic and delegates role-specific configurations to individual generators.
 * 
 * This factory provides a unified interface for creating sidebar configurations while
 * maintaining flexibility for role-specific requirements and data structures.
 */

import { AuthUserWithProfile } from "@/features/dashboard/shared/profile";
import { ClassroomT, Role, SidebarDataT } from "@/types";

import { generateSidebarConfig as generateAdminConfig } from "../roles/admin/sidebar-config";
import { generateSidebarConfig as generateEmployerConfig } from "../roles/employer/sidebar-config";
import { generateSidebarConfig as generateStudentConfig } from "../roles/student/sidebar-config";

/**
 * Common interface for all sidebar configuration generators.
 * Normalizes different function signatures to provide consistent API.
 * 
 * @param user - Authenticated user with profile information
 * @param classrooms - Optional array of classrooms (required for some roles)
 * @returns Sidebar configuration data structure
 */
interface SidebarConfigGenerator {
    (user: AuthUserWithProfile, classrooms?: ClassroomT[]): SidebarDataT;
}

/**
 * Role-to-generator mapping with wrapper functions to normalize different signatures.
 * Each role has specific requirements for sidebar configuration:
 * - Admin: Full management access with classroom oversight
 * - Class Manager: Student journey management interface
 * - Employer: Job-focused interface for recruitment
 * - Teacher: Facilitator interface for classroom management
 * - Student: Classroom-based learning interface
 * - Alumni: Limited access for graduated students
 * - Guest: Minimal configuration for unauthenticated users
 */
const SIDEBAR_CONFIG_GENERATORS: Record<Role, SidebarConfigGenerator> = {
    admin: (user, classrooms) => generateAdminConfig(user, classrooms || []),
    class_manager: (user) => ({ user, team: { name: "Jornada de Estudantes", logo: () => null }, navMain: [], projects: [] }),
    employer: (user) => generateEmployerConfig(user),
    teacher: (user) => ({ user, team: { name: "Facilitador", logo: () => null }, navMain: [], projects: [] }),
    student: (user, classrooms) => generateStudentConfig(user, classrooms || []),
    alumni: (user) => ({ user, team: { name: "Alumni", logo: () => null }, navMain: [], projects: [] }),
    guest: () => ({
        user: {} as AuthUserWithProfile,
        team: { name: "Guest", logo: () => null },
        navMain: [],
        projects: [],
    }),
};

/**
 * Factory function that creates sidebar configuration based on user role.
 * Provides type-safe role-based sidebar generation with fallback handling.
 * 
 * @param user - Authenticated user with profile information
 * @param userRole - User's role determining sidebar structure and permissions
 * @param classrooms - Optional array of classrooms (automatically handled based on role requirements)
 * @returns Complete sidebar configuration for the specified role
 * 
 * @example
 * ```typescript
 * const sidebarConfig = createSidebarConfig(user, 'admin', classrooms);
 * const employerConfig = createSidebarConfig(user, 'employer'); // No classrooms needed
 * ```
 */
export const createSidebarConfig = (user: AuthUserWithProfile, userRole: Role, classrooms?: ClassroomT[]): SidebarDataT => {
    const generator = SIDEBAR_CONFIG_GENERATORS[userRole];

    if (!generator) {
        console.warn(`No sidebar config generator found for role: ${userRole}`);
        return SIDEBAR_CONFIG_GENERATORS.guest(user);
    }

    return generator(user, classrooms);
};

/**
 * Utility function to determine if a role requires classroom data for sidebar configuration.
 * Used for optimizing data loading and determining which roles need classroom context.
 * 
 * @param role - User role to check
 * @returns True if the role requires classroom data, false otherwise
 * 
 * @example
 * ```typescript
 * if (roleRequiresClassrooms(userRole)) {
 *   await loadClassrooms();
 * }
 * ```
 */
export const roleRequiresClassrooms = (role: Role): boolean => {
    return ["admin", "student", "teacher", "class_manager"].includes(role);
};
