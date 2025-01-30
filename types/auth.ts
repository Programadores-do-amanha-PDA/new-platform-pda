import { AuthUser } from "@supabase/supabase-js";

export interface JwtPayload {
  user_role: string;
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
  user_roles?: UserRoleType[];
};

export type AuthUserWithProfileType = Partial<
  AuthUser & { profile?: Partial<ProfileType> }
>;
