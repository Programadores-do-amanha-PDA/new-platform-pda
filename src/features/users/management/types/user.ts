import { AuthUser } from "@supabase/supabase-js";
import { UserRole } from "@/features/auth/access-control/types";
import { Enrollment } from "@/features/enrollments";
import { Profile } from "../../profile/types/profile";

/**
 * User metadata structure for Supabase user_metadata field
 */
export interface UserMetadata {
    readonly full_name?: string;
    readonly user_email?: string;
    readonly avatar_url?: string;
    readonly [key: string]: unknown;
}

/**
 * User attributes for supabase.auth.updateUser()
 * Used when the authenticated user updates their own profile
 */
export interface UserAuthAttributes {
    /** Custom data object to store user metadata (maps to raw_user_meta_data) */
    readonly data?: UserMetadata;
    /** User's email */
    readonly email?: string;
    /** Nonce for reauthentication when updating password */
    readonly nonce?: string;
    /** User's password */
    readonly password?: string;
    /** User's phone */
    readonly phone?: string;
}

/**
 * Admin user attributes for supabase.auth.admin.createUser() and updateUserById()
 * Used by service role for admin operations
 */
export interface AdminUserAttributes {
    /** Application-specific metadata (maps to app_metadata) - service role only */
    readonly app_metadata?: object;
    /** Ban duration (e.g., '300ms', '2h45m', 'none' to lift) - service role only */
    readonly ban_duration?: string;
    /** User's email */
    readonly email?: string;
    /** Confirm email status - service role only */
    readonly email_confirm?: boolean;
    /** Custom user ID override - createUser only */
    readonly id?: string;
    /** Nonce for reauthentication when updating password */
    readonly nonce?: string;
    /** User's password */
    readonly password?: string;
    /** Password hash for migration (bcrypt, scrypt, argon2) - createUser only */
    readonly password_hash?: string;
    /** User's phone */
    readonly phone?: string;
    /** Confirm phone status - service role only */
    readonly phone_confirm?: boolean;
    /** Role claim in JWT (default: 'authenticated', avoid 'service_role') */
    readonly role?: string;
    /** User metadata (maps to raw_user_meta_data) */
    readonly user_metadata?: UserMetadata;
}

/**
 * Profile extended with Supabase relations for table display
 * Combines base Profile with user_role and enrollments from joins
 */
export interface ProfileWithRelations extends Profile {
    /** User's role from user_roles table */
    readonly user_role?: UserRole | null;
    /** User's classroom enrollments from user_classrooms table */
    readonly enrollments?: Enrollment[];
}

export type UserAuthLogin = {
    password: string;
    email: string;
    nonce: string;
    phone: string;
    data: object;
};

export type GetUserByIdProps = {
    userId: string;
};
export type GetUserByIdResult = AuthUser | null;

export type CreateNewUserProps = {
    userData: AdminUserAttributes;
};
export type CreateUserResult = AuthUser | null;

export type UpdateUserByIdProps = {
    id: string;
    updates: AdminUserAttributes;
};
export type UpdateUserByIdResult = AuthUser | null;

export type DeleteUserByIdProps = {
    id: string;
};
export type DeleteUserByIdResult = boolean;
