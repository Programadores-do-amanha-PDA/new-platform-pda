"use server";

import { logger } from "@/lib/logger";
import createClient from "../client";
import { ApiError } from "@/lib/errors/api-error";



const log = logger.child({ module: "middleware.supabase-auth" });

export const authenticateWithSupabase = async () => {
    try {
        log.info("Starting authentication process");
        const supabase = await createClient();

        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error || !session) {
            log.error({ err: error?.message }, "Authentication failed - no session");
            throw new ApiError(401, "Não autenticado");
        }

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            log.error({ err: userError?.message }, "Authentication failed - no user");
            throw new ApiError(401, "Usuário não encontrado");
        }

        const authResult = {
            userId: user.id,
            email: user.email!,
            role: user.user_metadata?.role || "user",
            session,
        };

        log.info(
            {
                userId: authResult.userId,
                email: authResult.email,
                role: authResult.role,
                sessionId: session.access_token.substring(0, 10) + "...",
            },
            "Authentication successful",
        );

        return authResult;
    } catch (error) {
        log.error({ err: error }, "API Error during authentication");
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Erro na autenticação");
    }
};
