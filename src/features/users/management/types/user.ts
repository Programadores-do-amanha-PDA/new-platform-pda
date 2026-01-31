import { AuthUser } from "@supabase/supabase-js";

export type UserAuthLogin = {
    password: string;
    email: string;
    nonce: string;
    phone: string;
    data: object;
};

export type GetAllUsersWithProfileResult = UserWithProfile[] | null;

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
