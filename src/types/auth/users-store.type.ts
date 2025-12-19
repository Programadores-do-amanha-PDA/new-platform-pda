import { AuthUser } from "@supabase/supabase-js";
import { AuthUserWithProfile, Role } from ".";

export interface IUsersState {
    users: Partial<AuthUserWithProfile>[];
    loading: boolean;
}

export type SetUsersProps = {
    users: Partial<AuthUserWithProfile>[];
};

export type GetAllUsersWithProfilesProps = {
    role?: Role;
};

export type CreateNewUserProps = {
    userData: Partial<AuthUser & { password: string }>;
};

export type UpdateUserStoreProps = {
    userID: string;
    updates: Partial<AuthUser & { password: string }>;
};

export type DeleteUserStoreProps = {
    userId: string;
};

export interface IUsersActions {
    setUsers: (props: SetUsersProps) => void;
    getAllUsersWithProfiles: (props?: GetAllUsersWithProfilesProps) => Promise<boolean>;
    createNewUser: (props: CreateNewUserProps) => Promise<string | false>;
    updateUser: (props: UpdateUserStoreProps) => Promise<boolean>;
    deleteUser: (props: DeleteUserStoreProps) => Promise<boolean>;
    reset: () => void;
}
