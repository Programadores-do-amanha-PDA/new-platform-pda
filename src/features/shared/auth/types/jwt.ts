import { Role } from "@/features/shared/access-control/types";

export interface JwtPayloadT {
  user_role: Role | null;
}