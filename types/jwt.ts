import { JwtPayload } from "jwt-decode";

export interface CustomJwtPayload extends JwtPayload {
    user_role?: string;
  }