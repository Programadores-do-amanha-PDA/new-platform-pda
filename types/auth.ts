import { AuthUser } from "@supabase/supabase-js";

export interface JwtPayload {
  user_role: "admin" | "employer" | "alumni" | null;
}

export interface User {
  id: string;
  email?: string;
}

export type UserRoleType = {
  id?: number;
  role: string;
  user_id?: string;
};

export type ProfileType = {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  user_roles?: UserRoleType[];
};

export type AuthUserWithProfileType = Partial<
  AuthUser & { profile?: Partial<ProfileType> }
>;
