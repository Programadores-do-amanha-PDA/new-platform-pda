import { useAuthStore } from "@/stores/shared/auth-store";

export const usePermissions = () => {
  const { 
    permissions, 
    userRole,
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions 
  } = useAuthStore();

  return {
    // User's current permissions
    permissions,
    userRole,
    
    // Permission checking functions for current user
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};