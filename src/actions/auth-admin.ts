"use server";

import { AuthUser } from "@supabase/supabase-js";
import { getAllProfiles, getAllProfilesFilteredByRole } from "@/actions/profiles";
import { createClientAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import {
    AuthUserWithProfileT,
    CreateUserProps,
    CreateUserResult,
    DeleteUserProps,
    DeleteUserResult,
    GetAllUsersProps,
    GetAllUsersResult,
    GetUserByIdProps,
    GetUserByIdResult,
    ProfileT,
    UpdateUserProps,
    UpdateUserResult,
} from "@/types";

const log = logger.child({ module: "auth_admin.actions" });

export const getAllUsers = async ({ role }: GetAllUsersProps): Promise<GetAllUsersResult> => {
    try {
        const supabase = await createClientAdmin();
        const {
            data: { users },
            error,
        } = await supabase.auth.admin.listUsers({ perPage: 10000 });

        if (error) throw error;

        if (!role) {
            const profiles = await getAllProfiles();
            if (!profiles) throw new Error("No users profile response");

            const usersWithPossibleProfiles = users.map((user) => {
                const profile = profiles.find((profile: ProfileT) => profile.id === user.id);
                return { user, profile };
            });

            const usersWithProfiles: AuthUserWithProfileT[] = usersWithPossibleProfiles
                .filter(({ profile }) => profile !== undefined)
                .map(({ user, profile }) => ({ ...user, profile: profile! }))
                .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

            return usersWithProfiles;
        } else {
            const filteredProfiles = await getAllProfilesFilteredByRole({role});

            if (!users || !filteredProfiles) {
                throw new Error(`Users or profiles for role ${role} is not available`);
            }

            const allFilteredUsers: AuthUserWithProfileT[] = filteredProfiles
                .map((profile) => {
                    const user = users?.find((p) => p.id === profile.id);
                    if (user) {
                        return {
                            ...user,
                            profile,
                        };
                    }
                    return null;
                })
                .filter((user): user is AuthUserWithProfileT => user !== null)
                .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

            return allFilteredUsers;
        }
    } catch (error) {
        log.error({ err: error, role, operation: "getAllUsers" }, "Failed to fetch all auth users");
        return null;
    }
};

export const getUserByID = async ({ userId }: GetUserByIdProps): Promise<GetUserByIdResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");

        const supabase = await createClientAdmin();
        if (!supabase) throw new Error("Invalid supabase client");

        const {
            data: { user },
            error,
        } = await supabase.auth.admin.getUserById(userId);

        if (error) throw error;

        return user as AuthUser;
    } catch (error) {
        log.error({ err: error, userId, operation: "getUserByID" }, "Failed to fetch user by ID");
        return null;
    }
};

export const createUser = async ({ userData }: CreateUserProps): Promise<CreateUserResult> => {
    try {
        if (!userData) throw new Error("Invalid user data");

        const supabase = await createClientAdmin();
        if (!supabase) throw new Error("Invalid supabase client");

        const {
            data: { user },
            error,
        } = await supabase.auth.admin.createUser(userData);

        if (error) throw error;

        log.info({ userId: user?.id }, "User created successfully");
        return user;
    } catch (error) {
        log.error({ err: error, operation: "createUser" }, "Failed to create auth user");
        return null;
    }
};

export const updateUser = async ({ userId, updates }: UpdateUserProps): Promise<UpdateUserResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");
        if (!updates) throw new Error("Invalid update data");

        const supabase = await createClientAdmin();
        if (!supabase) throw new Error("Invalid supabase client");

        const {
            data: { user },
            error,
        } = await supabase.auth.admin.updateUserById(userId, { ...updates });

        if (error || !user) throw error;

        log.info({ userId }, "User updated successfully");
        return user;
    } catch (error) {
        log.error({ err: error, userId, operation: "updateUser" }, "Failed to update auth user");
        return null;
    }
};

export const deleteUser = async ({ userId }: DeleteUserProps): Promise<DeleteUserResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");

        const supabase = await createClientAdmin();
        if (!supabase) throw new Error("Invalid supabase client");

        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) throw error;

        log.info({ userId }, "User deleted successfully");
        return true;
    } catch (error) {
        log.error({ err: error, userId, operation: "deleteUser" }, "Failed to delete auth user");
        return false;
    }
};
