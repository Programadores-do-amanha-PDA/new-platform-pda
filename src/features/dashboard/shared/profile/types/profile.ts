import { AuthUser } from "@supabase/supabase-js";
import { UserRoleT, Enrollment } from "@/types";

export interface Profile {
    id: string;
    full_name: string;
    bio?: string;
    avatar_url?: string | null;
    user_roles?: UserRoleT[];
    created_at?: Date;
    updated_at?: Date;
    classrooms?: Enrollment[];
}

export type AuthUserWithProfile = AuthUser & { profile: Profile };