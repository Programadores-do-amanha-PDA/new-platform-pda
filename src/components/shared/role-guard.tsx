"use client";

import { useAuth } from "@/features/auth/shared";
import { Role } from "@/features/auth/access-control/types";

interface RoleGuardProps {
  role?: Role;
  roles?: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function RoleGuard({
  role,
  roles,
  fallback = null,
  children,
}: RoleGuardProps) {
  const { userRole } = useAuth();

  let hasAccess = false;

  if (role) {
    hasAccess = userRole === role;
  } else if (roles) {
    hasAccess = roles.includes(userRole as Role);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
