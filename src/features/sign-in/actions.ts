"use server";

import { REGEX_FOR_EMAIL_VALIDATION, REGEX_FOR_PASSWORD_VALIDATION } from "@/utils/regex/user-regex-validations";
import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "sign-in/actions" });

type SignInWithEmailAndPasswordProps = {
    email: string;
    password: string;
};

export async function signInWithEmailAndPassword({ email, password }: SignInWithEmailAndPasswordProps) {
    try {
        if (!email || !REGEX_FOR_EMAIL_VALIDATION.test(email) || !password || !REGEX_FOR_PASSWORD_VALIDATION.test(password))
            throw new Error("Invalid credentials");

        const supabase = await getSupabaseClient();

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        if (!data.session || !data.user) throw new Error("No session or user returned");

        return { error: false, data };
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message === "Request failed with status code 403" || error.message === "Email not confirmed")
        ) {
            return { error: true, confirmation: true };
        } else {
            log.debug({ err: error, email, password }, "Attempt to sign in with unconfirmed email");
            return { error: true, confirmation: false };
        }
    }
}

