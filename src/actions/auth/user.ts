"use server";

import { createClient } from "@/lib/supabase/server";
import { UserAuthLoginT } from "@/types";
import { AuthError } from "@supabase/supabase-js";


export const updateAuthUser = async (updates: Partial<UserAuthLoginT>) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.updateUser({ ...updates });

        if (error || !data) throw error;

        return { user: data.user };
    } catch (error) {
        console.error("Error on update auth user", error);
        if (error instanceof AuthError) {
            return { error: error.code, isAuthError: true };
        }
        return null;
    }
};

export const setSession = async (access_token: string, refresh_token: string) => {
    try {
        const supabase = await createClient();

        const {
            data: { session },
            error,
        } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });
        if (error) throw { error: error };
        return { session: session };
    } catch (error) {
        console.error(error);
        return { error: error };
    }
};

export const signOut = async () => {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return true;
    } catch (error) {
        console.error(error);

        return false;
    }
};
