"use server";

import { AuthUser } from "@supabase/supabase-js";
import { createClientAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

import {
    GetUserByIdProps,
    GetUserByIdResult,
    CreateNewUserProps,
    CreateUserResult,
    UpdateUserByIdProps,
    UpdateUserByIdResult,
    DeleteUserByIdProps,
    DeleteUserByIdResult,
} from "../types";

const log = logger.child({ module: "users.actions" });


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

/**
 * Cria um novo usuário.
 * @param userData Dados do usuário a ser criado (email, password, user_metadata).
 * @returns Dados do usuário criado ou null em caso de erro.
 */
export const createUser = async ({ userData }: CreateNewUserProps): Promise<CreateUserResult> => {
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

/**
 * Atualiza um usuário existente.
 * @param id ID do usuário a atualizar.
 * @param updates Objeto com os campos a serem atualizados.
 * @returns Dados do usuário atualizado ou null em caso de erro.
 */
export const updateUser = async ({ id, updates }: UpdateUserByIdProps): Promise<UpdateUserByIdResult> => {
    try {
        if (!id) throw new Error("Invalid user id");
        if (!updates) throw new Error("Invalid update data");

        const supabase = await createClientAdmin();
        if (!supabase) throw new Error("Invalid supabase client");

        const {
            data: { user },
            error,
        } = await supabase.auth.admin.updateUserById(id, { ...updates });

        if (error || !user) throw error;

        log.info({ userId: id }, "User updated successfully");
        return user;
    } catch (error) {
        log.error({ err: error, userId: id, operation: "updateUser" }, "Failed to update auth user");
        return null;
    }
};

/**
 * Deleta um usuário existente.
 * @param id ID do usuário a deletar.
 * @returns true se sucesso, false em caso de erro.
 */
export const deleteUser = async ({ id }: DeleteUserByIdProps): Promise<DeleteUserByIdResult> => {
    try {
        if (!id) throw new Error("Invalid user id");

        const supabase = await createClientAdmin();
        if (!supabase) throw new Error("Invalid supabase client");

        const { error } = await supabase.auth.admin.deleteUser(id);

        if (error) throw error;

        log.info({ userId: id }, "User deleted successfully");
        return true;
    } catch (error) {
        log.error({ err: error, userId: id, operation: "deleteUser" }, "Failed to delete auth user");
        return false;
    }
};
