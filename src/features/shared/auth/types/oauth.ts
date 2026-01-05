import { AuthError, Session, User } from "@supabase/supabase-js";

export type VerifyOtpSuccess = {
  session: Session;
  user: User;
  error?: never;
};

export type VerifyOtpError = {
  session?: never;
  user?: never;
  error: AuthError | Error;
};

export type VerifyOtpResults = VerifyOtpSuccess | VerifyOtpError;