export interface JwtPayload {
  user_role: string;
}

export interface User {
  id: string;
  email?: string;
}
