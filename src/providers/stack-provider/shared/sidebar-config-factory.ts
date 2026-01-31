import { ClassroomT, SidebarDataT } from "@/types";
import { Role } from "@/features/auth/access-control/types";

import { generateSidebarConfig as generateAdminConfig } from "../roles/admin/sidebar-config";
import { generateSidebarConfig as generateEmployerConfig } from "../roles/employer/sidebar-config";
import { generateSidebarConfig as generateStudentConfig } from "../roles/student/sidebar-config";
import { Profile } from "@/features/users/profile";

/**
 * Common interface for all sidebar configuration generators.
 * Normalizes different function signatures to provide consistent API.
 * 
 * @param userProfile - Authenticated user profile
 * @param classrooms - Optional array of classrooms (required for some roles)
 * @returns Sidebar configuration data structure
 */
interface SidebarConfigGenerator {
    (userProfile: Profile, classrooms?: ClassroomT[]): SidebarDataT;
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
    admin: (userProfile, classrooms) => generateAdminConfig(userProfile, classrooms || []),
    class_manager: (userProfile) => ({ userProfile, team: { name: "Jornada de Estudantes", logo: () => null }, navMain: [], projects: [] }),
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
 * Provides type-safe role-based sidebar generation with fallback handling.
 * 
 * @param userProfile - Authenticated user profile
 * @param userRole - User's role determining sidebar structure and permissions
 * @param classrooms - Optional array of classrooms (automatically handled based on role requirements)
 * @returns Complete sidebar configuration for the specified role
 * 
 * @example
 * ```typescript
 * const sidebarConfig = createSidebarConfig(userProfile, 'admin', classrooms);
 * const employerConfig = createSidebarConfig(userProfile, 'employer'); // No classrooms needed
 * ```
 */
export const createSidebarConfig = (userProfile: Profile, userRole: Role, classrooms?: ClassroomT[]): SidebarDataT => {
    const generator = SIDEBAR_CONFIG_GENERATORS[userRole];

    if (!generator) {
        console.warn(`No sidebar config generator found for role: ${userRole}`);
        return SIDEBAR_CONFIG_GENERATORS.guest(userProfile);
    }

    return generator(userProfile, classrooms);
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
