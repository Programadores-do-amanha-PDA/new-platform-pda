"use server";

import { AuthError, AuthUser } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { getAllProfiles, Profile } from "@/features/users/profile";
import { Role, UserRole } from "@/features/auth/access-control/types";
import { Enrollment } from "@/features/enrollments";

const log = logger.child({ module: "FullUserDataActions" });

type GetFullUserDataProps = {
    readonly userId: string;
};

type FullUserData = {
    readonly profile: Profile;
    readonly userRole: UserRole | null;
    readonly enrollments: Enrollment[];
};

type GetFullUserDataResult = { data: FullUserData; error: null } | { data: null; error: string };

/**
 * Fetches complete user data including profile, user role, and enrollments.
 * This action aggregates data from multiple tables to compose the full User object.
 *
 * @param {GetFullUserDataProps} params - Parameters object
 * @param {string} params.userId - The user ID to fetch data for
 * @returns {Promise<GetFullUserDataResult>} The full user data or an error
 *
 * @example
 * const { user, error } = await getAllCurrentUserDataAsync({ userId: "123" });
 * if (error) console.error("Failed to fetch user data:", error);
 */
export const getAllCurrentUserDataByIdAsync = async ({ userId }: GetFullUserDataProps): Promise<GetFullUserDataResult> => {
    try {
        if (!userId) throw new Error("userId is required");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(
                "*, user_role:user_roles(id, role, user_id), enrollments:user_classrooms(user_id, classroom_id, short_id, mode, created_at)",
            )
            .eq("id", userId)
            .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData) throw new Error("Profile not found");

        const profile: Profile = {
            id: profileData.id,
            email: profileData.email,
            email_confirmed_at: profileData.email_confirmed_at,
            phone: profileData.phone,
            full_name: profileData.full_name,
            bio: profileData.bio,
            avatar_url: profileData.avatar_url,
            created_at: profileData.created_at,
            last_sign_in_at: profileData.last_sign_in_at,
            updated_at: profileData.updated_at,
        };

        const rawUserRole = Array.isArray(profileData.user_role) ? profileData.user_role[0] : profileData.user_role;
        const userRole: UserRole | null = rawUserRole
            ? {
                  id: rawUserRole.id,
                  role: rawUserRole.role,
                  user_id: rawUserRole.user_id,
              }
            : null;

        const enrollments: Enrollment[] =
            profileData.enrollments?.map((e: Enrollment) => ({
                user_id: e.user_id,
                classroom_id: e.classroom_id,
                short_id: e.short_id,
                mode: e.mode,
                created_at: e.created_at,
            })) ?? [];

        return {
            data: {
                profile,
                userRole,
                enrollments,
            },
            error: null,
        };
    } catch (error) {
        log.error({ err: error, userId, operation: "getFullUserDataAsync" }, "Failed to fetch full user data");
        return {
            data: null,
            error: error instanceof Error || error instanceof AuthError ? error.message : "unknown error",
        };
    }
};

type GetAllUsersDataByRoleResult =
    | {
          data: {
              profiles: Profile[];
              usersRoles: (UserRole | null)[];
              enrollmentsByUserId: Record<string, Enrollment[]>;
          };
          error: null;
      }
    | {
          data: null;
          error: string;
      };

/**
 * Retrieves all user data filtered by role from the database.
 *
 * @param options - The options object for filtering users.
 * @param options.role - Optional role to filter users by. If not provided, returns all users.
 *
 * @returns A promise that resolves to an object containing:
 * - `data` - An object with `profiles`, `usersRoles`, and `usersEnrollments` arrays if successful, or `null` on error.
 * - `error` - `null` if successful, or an error message string if the operation failed.
 *
 * @throws Will not throw directly, but catches and returns errors in the result object.
 *
 * @example
 * ```typescript
 * // Get all users with 'student' role
 * const result = await getAllUsersDataByRoleAsync({ role: 'student' });
 *
 * // Get all users regardless of role
 * const allUsers = await getAllUsersDataByRoleAsync();
 * ```
 */
export const getAllUsersDataByRoleAsync = async ({ role }: { role?: Role } = {}): Promise<GetAllUsersDataByRoleResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const query = supabase
            .from("profiles")
            .select(
                "*, user_role:user_roles(id, role, user_id), enrollments:user_classrooms(user_id, classroom_id, short_id, mode, created_at)",
            );

        if (role) {
            query.eq("user_role.role", role);
        }

        const { data: profileData, error: profileError } = await query;

        if (profileError) throw profileError;
        if (!profileData) throw new Error("Profile not found");

        const profiles: Profile[] = profileData.map((profile: Profile) => ({
            id: profile.id,
            email: profile.email,
            email_confirmed_at: profile.email_confirmed_at,
            phone: profile.phone,
            full_name: profile.full_name,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
            last_sign_in_at: profile.last_sign_in_at,
            updated_at: profile.updated_at,
        }));

        const usersRoles: (UserRole | null)[] = profileData.map((profileData) => {
            const rawUserRole = Array.isArray(profileData.user_role) ? profileData.user_role[0] : profileData.user_role;
            return rawUserRole
                ? {
                      id: rawUserRole.id,
                      role: rawUserRole.role,
                      user_id: rawUserRole.user_id,
                  }
                : null;
        });

        const enrollmentsByUserId: Record<string, Enrollment[]> = Object.fromEntries(
            profileData.map((profile) => [
                profile.id,
                profile.enrollments?.map((e: Enrollment) => ({
                    user_id: e.user_id,
                    classroom_id: e.classroom_id,
                    short_id: e.short_id,
                    mode: e.mode,
                    created_at: e.created_at,
                })) ?? [],
            ])
        );

        return {
            data: {
                profiles,
                usersRoles,
                enrollmentsByUserId,
            },
            error: null,
        };
    } catch (error) {
        log.error({ err: error, role, operation: "getAllUsersDataByIdAsync" }, "Failed to fetch all auth users");
        return { data: null, error: error instanceof Error || error instanceof AuthError ? error.message : "unknown error" };
    }
};
