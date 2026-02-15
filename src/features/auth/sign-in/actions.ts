"use server";

import { REGEX_FOR_EMAIL_VALIDATION, REGEX_FOR_PASSWORD_VALIDATION } from "@/utils/regex/user-regex-validations";
import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { logger } from "@/lib/logger";
import { Session } from "@supabase/supabase-js";
import { signInSchema } from "./utils";
import { serializeError } from "../shared/utils";

const log = logger.child({ module: "sign-in/actions" });

type SignInWithEmailAndPasswordProps = {
    email: string;
    password: string;
};

type SignInWithEmailAndPasswordResponse = {
    error: boolean;
    confirmation?: boolean;
    data?: {
        session: Session;
    };
    message?: string;
};

export async function signInWithEmailAndPassword({
    email,
    password,
}: SignInWithEmailAndPasswordProps): Promise<SignInWithEmailAndPasswordResponse> {
    try {
        if (!signInSchema.parse({ email, password })) throw new Error("Invalid credentials");

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
            log.debug({ err: serializeError(error), email, password }, "Attempt to sign in with unconfirmed email");
            return { error: true, confirmation: false };
        }
    }
}
