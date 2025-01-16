export interface JwtPayload {
  user_role: string;
}

export interface User {
  id: string;
  email?: string;
}

export interface UserRoleType {
  id: number;
  role: string;
}
