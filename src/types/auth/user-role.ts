export type RolesT =
  | "admin"
  | "employer"
  | "class_manager"
  | "teacher"
  | "student"
  | "alumni";

export interface UserRoleT {
  id?: number;
  role: RolesT;
  user_id?: string;
}

export interface JwtPayloadT {
  user_role: RolesT | null;
}
