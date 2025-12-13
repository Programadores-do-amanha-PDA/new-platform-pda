import { AuthUser } from "@supabase/supabase-js";
import { AuthUserWithProfileT, RolesT } from ".";

export interface IUsersState {
    users: Partial<AuthUserWithProfileT>[];
    loading: boolean;
}

export type SetUsersProps = {
    users: Partial<AuthUserWithProfileT>[];
};

export type GetAllUsersWithProfilesProps = {
    role?: RolesT;
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
