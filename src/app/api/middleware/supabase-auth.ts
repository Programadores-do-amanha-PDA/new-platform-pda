"use server";
import { ApiError } from "@/lib/errors/api-error";
import { createClient } from "@/lib/supabase/server";
import { logInfo, logError, logWarn } from "@/lib/logger";

export const authenticateWithSupabase = async () => {
  try {
    logInfo('Starting authentication process');
    const supabase = await createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      logWarn('Authentication failed - no session', { error: error?.message });
      throw new ApiError(401, "Não autenticado");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logWarn('Authentication failed - no user', { error: userError?.message });
      throw new ApiError(401, "Usuário não encontrado");
    }

    const authResult = {
      userId: user.id,
      email: user.email!,
      role: user.user_metadata?.role || "user",
      session,
    };

    logInfo('Authentication successful', {
      userId: authResult.userId,
      email: authResult.email,
      role: authResult.role,
      sessionId: session.access_token.substring(0, 10) + '...'
    });

    return authResult;
  } catch (error) {
    if (error instanceof ApiError) {
      logError('API Error during authentication', error);
      throw error;
    }
    logError('Unexpected error during authentication', error);
    throw new ApiError(500, "Erro na autenticação");
  }
};
