import { AuthUser } from "@supabase/supabase-js";
import { Role } from "./user-role";
import { AuthUserWithProfile } from "@/features/dashboard/shared/profile/types/profile";

export interface User {
    id: string;
    email?: string;
}


export type UserAuthLoginT = {
    password: string;
    email: string;
    nonce: string;
    phone: string;
    data: object;
};

export type GetAllUsersProps = {
    role?: Role;
};
export type GetAllUsersResult = AuthUserWithProfile[] | null;

export type GetUserByIdProps = {
    userId: string;
};
export type GetUserByIdResult = AuthUser | null;

export type CreateUserProps = {
    userData: Partial<AuthUser>;
};
export type CreateUserResult = AuthUser | null;

export type UpdateUserProps = {
    userId: string;
    updates: Partial<AuthUser>;
};
export type UpdateUserResult = AuthUser | null;

export type DeleteUserProps = {
    userId: string;
};
export type DeleteUserResult = boolean;
