// Global imports
import { Session } from "@supabase/supabase-js";

export interface LoginFormDataT {
  email: string;
  password: string;
}

export interface LoginResponseT {
  error: boolean;
  confirmation?: boolean;
  data?: {
    session: Session;
  };
  message?: string;
}

// Component props
export interface LoginFormPropsT {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
