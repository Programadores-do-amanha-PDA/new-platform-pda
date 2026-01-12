import { AuthUser } from "@supabase/supabase-js";
import { UserRoleT } from "@/types";
import { Enrollment } from "../../shared/enrollments";

export interface Profile {
    id: string;
    full_name: string;
    bio?: string;
    avatar_url?: string | null;
    user_role: UserRoleT;
    created_at?: Date;
    updated_at?: Date;
    enrollments?: Pick<Enrollment, "short_id" | "classroom_id" | "mode">[];
}

export type AuthUserWithProfile = AuthUser & { profile: Profile };
