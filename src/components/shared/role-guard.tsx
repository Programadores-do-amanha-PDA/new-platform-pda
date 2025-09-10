"use client";
import useAuth from "@/hooks/use-auth";
import { RolesT } from "@/types";

interface RoleGuardProps {
  role?: RolesT;
  roles?: RolesT[];
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
    hasAccess = roles.includes(userRole as RolesT);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
