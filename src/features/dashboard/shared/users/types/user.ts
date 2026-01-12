import { AuthUser } from "@supabase/supabase-js";
import { AuthUserWithProfile } from "@/features/dashboard/profile/types/profile";
import { Role } from "@/types";

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

export type CreateNewUserProps = {
    userData: Partial<AuthUser>;
};
export type CreateUserResult = AuthUser | null;

export type UpdateUserByIdProps = {
    id: string;
    updates: Partial<AuthUser>;
};
export type UpdateUserByIdResult = AuthUser | null;

export type DeleteUserByIdProps = {
    id: string;
};
export type DeleteUserByIdResult = boolean;
