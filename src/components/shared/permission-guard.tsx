"use client";
import { useUserPermissions } from "@/features/auth/access-control/hooks/use-user-permissions";

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions: userPermissions } = useUserPermissions();
  console.log(userPermissions, permission);

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission({permission});
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions({permissions})
      : hasAnyPermission({permissions});
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}