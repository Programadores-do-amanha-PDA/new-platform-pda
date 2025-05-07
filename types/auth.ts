import { AuthUser } from "@supabase/supabase-js";
import { UserClassroomT } from "./user-classroom";

export interface JwtPayload {
  user_role: "admin" | "employer" | "alumni" | null;
}

export type RolesType =
  | "admin"
  | "employer"
  | "class_manager"
  | "student"
  | "teacher"
  | "alumni";

export interface User {
  id: string;
  email?: string;
}

export type UserRoleType = {
  id?: number;
  role: RolesType;
  user_id?: string;
};

export type ProfileType = {
  id?: string;
  email: string;
  full_name: string;
  bio?: string;
  avatarUrl?: string | null;
  user_roles?: UserRoleType[];
  created_at?: Date;
  updated_at?: Date;
  user_id?: string;
  classrooms?: UserClassroomT[];
};

export type AuthUserWithProfileType = AuthUser & { profile: ProfileType };
