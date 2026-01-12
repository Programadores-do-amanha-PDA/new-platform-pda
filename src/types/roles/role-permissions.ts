export interface RolePermission {
  id: number;
  role: string;
  permission: string;
}

export interface UserPermissions {
  permissions: string[];
}

export type Permission = string;