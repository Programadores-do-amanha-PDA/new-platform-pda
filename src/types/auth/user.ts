import { AuthUser } from "@supabase/supabase-js";
import { UserClassroomT } from "./user-classroom";
import { RolesT, UserRoleT } from "./user-role";

export interface User {
    id: string;
    email?: string;
}

export interface ProfileT {
    id: string;
    email: string;
    full_name: string;
    bio?: string;
    avatar_url?: string | null;
    user_roles?: UserRoleT[];
    created_at?: Date;
    updated_at?: Date;
    classrooms?: UserClassroomT[];
}

export type AuthUserWithProfileT = AuthUser & { profile: ProfileT };

export type UserAuthLoginT = {
    password: string;
    email: string;
    nonce: string;
    phone: string;
    data: object;
};

export type GetAllUsersProps = {
    role?: RolesT;
};
export type GetAllUsersResult = AuthUserWithProfileT[] | null;

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
