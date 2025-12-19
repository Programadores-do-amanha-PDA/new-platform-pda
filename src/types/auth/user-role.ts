export type Role =
  | "admin"
  | "employer"
  | "class_manager"
  | "teacher"
  | "student"
  | "alumni"
  | "guest";

export interface UserRoleT {
  id?: number;
  role: Role;
  user_id?: string;
}

export interface JwtPayloadT {
  user_role: Role | null;
}
