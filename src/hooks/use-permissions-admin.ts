import { usePermissionsStore } from "@/stores/shared/permissions-store";

export const usePermissionsAdmin = () => {
  const {
    allRolePermissions,
    rolePermissions,
    loading,
    operationLoading,
    fetchAllRolePermissions,
    fetchPermissionsForRole,
    fetchPermissionsForAllRoles,
    addPermissionToRole,
    removePermissionFromRole,
    removeAllPermissionsFromRole,
    getRolePermissions,
    roleHasPermission,
    roleHasAnyPermission,
    roleHasAllPermissions,
    reset,
  } = usePermissionsStore();

  return {
    // State
    allRolePermissions,
    rolePermissions,
    loading,
    operationLoading,
    
    // Fetch operations
    fetchAllRolePermissions,
    fetchPermissionsForRole,
    fetchPermissionsForAllRoles,
    
    // Admin operations
    addPermissionToRole,
    removePermissionFromRole,
    removeAllPermissionsFromRole,
    
    // Utility functions
    getRolePermissions,
    roleHasPermission,
    roleHasAnyPermission,
    roleHasAllPermissions,
    
    // State management
    reset,
  };
};