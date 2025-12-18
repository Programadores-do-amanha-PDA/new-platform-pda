// Global imports
import { Session } from "@supabase/supabase-js";

export interface SignInFormSchema {
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
