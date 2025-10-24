import createClient from "@/lib/supabase/client";
import { EmailOtpType, Session, User, AuthError } from "@supabase/supabase-js";

type VerifyOtpSuccess = {
  session: Session;
  user: User;
  error?: never;
};

type VerifyOtpError = {
  session?: never;
  user?: never;
  error: AuthError | Error;
};

type VerifyOtpResults = VerifyOtpSuccess | VerifyOtpError;

export const verifyOtp = async (
  tokenHash: string,
  type: string
): Promise<VerifyOtpResults> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    if (error) {
      console.error("Erro no verifyOtp:", error);
      return { error: error };
    }

    if (!data.session) {
      return { error: new Error("Sessão não criada") };
    }

    return {
      session: data.session,
      user: data.session.user,
    };
  } catch (error) {
    console.error("Erro no handlePasswordRecovery:", error);
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};
