import { Role } from "@/types/roles";

export interface JwtPayloadT {
  user_role: Role | null;
}