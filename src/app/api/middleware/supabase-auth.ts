"use server";
import { ApiError } from "@/lib/errors/api-error";
import { createClient } from "@/lib/supabase/server";

export const authenticateWithSupabase = async () => {
  try {
    const supabase = await createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      throw new ApiError(401, "Não autenticado");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new ApiError(401, "Usuário não encontrado");
    }

    return {
      userId: user.id,
      email: user.email!,
      role: user.user_metadata?.role || "user",
      session,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Erro na autenticação");
  }
};
