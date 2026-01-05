import { useAuthStore } from "@/features/shared/auth";

export const usePermissions = () => {
  const { 
    permissions, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions 
  } = useAuthStore();

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};