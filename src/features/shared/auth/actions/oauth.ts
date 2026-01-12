import { EmailOtpType } from "@supabase/supabase-js";
import createClient from "@/lib/supabase/client";
import { VerifyOtpResults } from "@/features/shared/auth";

export const verifyOtp = async (
  tokenHash: string,
  type: string,
): Promise<VerifyOtpResults> => {
  try {
    if (!tokenHash) throw new Error("Token hash not provided");
    if (!type) throw new Error("Type not provided");

    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    console.log(data);

    if (error) throw new Error(error.message);

    if (!data.session) throw new Error("Session not created");

    return {
      session: data.session,
      user: data.user || data.session.user,
    };
  } catch (error) {
    console.error("Erro no handlePasswordRecovery:", error);
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};
