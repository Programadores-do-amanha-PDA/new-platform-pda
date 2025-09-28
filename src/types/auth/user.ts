import { AuthUser } from "@supabase/supabase-js";
import { UserClassroomT } from "./user-classroom";
import { UserRoleT } from "./user-role";

export interface User {
  id: string;
  email?: string;
}

export interface ProfileT {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  avatar_url?: string | null;
  user_roles?: UserRoleT[];
  created_at?: Date;
  updated_at?: Date;
  classrooms?: UserClassroomT[];
}

export type AuthUserWithProfileT = AuthUser & { profile: ProfileT };

export type UserAuthLogin = {
  password: string;
  email: string;
  nonce: string;
  phone: string;
  data: object;
};
