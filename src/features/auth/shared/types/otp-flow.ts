import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Session } from "@supabase/supabase-js";

export interface OtpFlowParamsT {
    tokenHash: string;
    type: string | null;
    router: AppRouterInstance;
    updateAuthState: ({ session }: { readonly session: Session }) => Promise<boolean>;
    onSuccess?: (session: Session, type: string | null) => void;
    onError?: (error: Error) => void;
}

export type OtpFlowResultT =
    | {
          session: Session;
          redirectPath: string;
          error: null;
      }
    | {
          session: null;
          redirectPath: null;
          error: Error;
      };
