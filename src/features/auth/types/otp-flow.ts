// Global imports
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Session, User } from "@supabase/supabase-js";

export interface OtpFlowParamsT {
  /** Token hash from email/SMS verification */
  tokenHash: string;
  /** Type of authentication flow */
  type: string | null;
  /** Next.js router instance for navigation */
  router: AppRouterInstance;
  /** Auth state update function from useAuth hook */
  updateAuthState: (session: Session) => void;
  /** Optional callback for successful authentication */
  onSuccess?: (session: Session, type: string | null) => void;
  /** Optional callback for authentication errors */
  onError?: (error: Error) => void;
}

export interface OtpFlowResultT {
  success: boolean;
  session?: Session;
  user?: User;
  redirectPath?: string;
  error?: Error;
}