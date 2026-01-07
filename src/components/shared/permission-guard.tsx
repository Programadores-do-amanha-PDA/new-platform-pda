"use client";
import { usePermissions } from "@/hooks/use-permissions";

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
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

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