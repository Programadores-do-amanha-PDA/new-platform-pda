export interface RolePermissionT {
  id: number;
  role: string;
  permission: string;
}

export interface UserPermissionsT {
  permissions: string[];
}

export type PermissionT = string;