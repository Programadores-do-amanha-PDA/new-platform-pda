import { Role } from "@/features/auth/access-control/types";

export interface JwtPayloadT {
  sub?: string
  user_role: Role | null;
}