# Role Permissions Actions

Server-side actions for managing role-based permissions. These functions handle all operations related to defining, retrieving, and modifying which permissions are granted to specific roles in the application.

## Overview

Role permissions define what actions and features are available to users with a particular role. This system allows for fine-grained access control where each role can have a specific set of permissions. The `role_permissions` table maintains the mapping between roles and their associated permissions.

## Actions

### `getAllRolePermissionsAsync()`

Fetches all role permissions from the system.

**Parameters:**

- None

**Returns:**

- `Promise<RolePermission[] | null>` - Array of all role permission records, or null on error

**Error Handling:**

- Returns `null` if Supabase client is not initialized
- Returns `null` if database query fails
- Logs detailed error information with operation context

**Example:**

```typescript
const allPermissions = await getAllRolePermissionsAsync();

if (allPermissions) {
    console.log(`Total role-permission mappings: ${allPermissions.length}`);

    // Build permission matrix
    const permissionMatrix = allPermissions.reduce(
        (acc, curr) => {
            if (!acc[curr.role]) acc[curr.role] = [];
            acc[curr.role].push(curr.permission);
            return acc;
        },
        {} as Record<string, string[]>,
    );

    console.log("Admin permissions:", permissionMatrix["admin"]);
} else {
    console.error("Failed to fetch permissions");
}
```

**Use Cases:**

- Building admin dashboards for permission management
- Generating permission matrices and reports
- System audits and compliance checks
- Exporting role-permission configurations
- Initializing permission caches

---

### `getPermissionsByRoleAsync()`

Fetches all permissions for a specific role.

**Parameters:**

- `role` (Role) - The role to fetch permissions for

**Returns:**

- `Promise<Permission[] | null>` - Array of permissions for the role, or null on error

**Error Handling:**

- Returns `null` if role is not provided
- Returns `null` if Supabase client is not initialized
- Returns `null` if database query fails
- Logs error with role information for debugging

**Example:**

```typescript
const adminPermissions = await getPermissionsByRoleAsync({ role: "admin" });

if (adminPermissions) {
    console.log("Admin can perform:", adminPermissions);

    // Check if user can perform specific action
    const canDeleteUsers = adminPermissions.includes("delete:users");
    if (canDeleteUsers) {
        // Show delete button
    }
} else {
    console.error("Failed to fetch admin permissions");
}
```

**Use Cases:**

- Checking what permissions a role has
- Building role-based UI (show features based on permissions)
- Authorization checks in Server Actions
- Populating permission dropdowns in admin panels
- Caching permissions at app startup

**Important Notes:**

- Use this after `getUserRoleAsync()` to get all permissions for the current user's role
- Results can be cached since permissions typically don't change frequently
- Consider pre-fetching all role permissions at app initialization
- Use in combination with custom hooks like `useUserPermissions()` for client-side checks

---

### `insertRolePermissionAsync()`

Inserts a new permission for a specific role.

**Parameters:**

- `role` (Role) - The role to add the permission to
- `permission` (string) - Permission identifier to be added (e.g., 'create:posts', 'delete:users')

**Returns:**

- `Promise<RolePermission | null>` - Created role permission record, or null on error

**Error Handling:**

- Returns `null` if role is not provided
- Returns `null` if permission is not provided
- Returns `null` if Supabase client is not initialized
- Returns `null` if database insert fails (e.g., duplicate entry)
- Logs success and error information with full context

**Example:**

```typescript
// Grant the 'edit:posts' permission to the 'moderator' role
const result = await insertRolePermissionAsync({
    role: "moderator",
    permission: "edit:posts",
});

if (result) {
    console.log("Permission granted:", result);
    // Notify admin that permission was added
    toast.success("Permission added successfully");
    // Refresh permission cache
    await refreshPermissionCache("moderator");
} else {
    console.error("Failed to grant permission");
    toast.error("Failed to add permission");
}
```

**Use Cases:**

- Admin interface for granting permissions to roles
- Setting up new roles during system configuration
- Dynamically adjusting role permissions
- Implementing role management workflows

**Important Notes:**

- Permission strings should follow a consistent naming convention (e.g., `action:resource`)
- Consider validating permission names against a predefined list
- May require cache invalidation after adding permissions
- Log all permission changes for audit purposes
- Consider restricting who can call this function (admin-only)

---

### `deleteRolePermission()`

Deletes a specific permission from a role.

**Parameters:**

- `role` (Role) - The role to remove the permission from
- `permission` (string) - Permission identifier to be removed

**Returns:**

- `Promise<boolean>` - `true` if deletion was successful, `false` on error

**Error Handling:**

- Returns `false` if role is not provided
- Returns `false` if permission is not provided
- Returns `false` if Supabase client is not initialized
- Returns `false` if database delete operation fails
- Logs error information with operation context

**Example:**

```typescript
// Revoke 'edit:posts' permission from 'moderator' role
const success = await deleteRolePermission({
    role: "moderator",
    permission: "edit:posts",
});

if (success) {
    console.log("Permission revoked successfully");
    toast.success("Permission removed");
    // Invalidate users with this role
    await invalidateRolePermissionCache("moderator");
} else {
    console.error("Failed to revoke permission");
    toast.error("Failed to remove permission");
}
```

**Use Cases:**

- Removing permissions from roles in admin interface
- Adjusting role capabilities in response to policy changes
- Restricting access during security incidents
- Managing role permissions over time

**Important Notes:**

- This is a targeted operation removing only one permission
- For removing all permissions from a role, use `deleteAllPermissionsForRoleAsync()`
- Consider audit logging all permission revocations
- May require invalidating user sessions if permission affects active users
- Update related caches after deletion

---

### `deleteAllPermissionsForRoleAsync()`

Deletes all permissions associated with a specific role.

**Parameters:**

- `role` (Role) - The role for which all permissions should be deleted

**Returns:**

- `Promise<boolean>` - `true` if all deletions were successful, `false` on error

**Error Handling:**

- Returns `false` if role is not provided
- Returns `false` if Supabase client is not initialized
- Returns `false` if database delete operation fails
- Logs detailed error information with operation context

**Example:**

```typescript
// Remove all permissions from the 'guest' role
const success = await deleteAllPermissionsForRoleAsync({ role: "guest" });

if (success) {
    console.log("All permissions revoked from guest role");
    // Invalidate all guest users
    await invalidateRoleUsers("guest");
    toast.success("Guest role permissions cleared");
} else {
    console.error("Failed to clear guest permissions");
    toast.error("Failed to update guest role");
}
```

**Use Cases:**

- Completely restricting a role by removing all permissions
- Cleaning up deprecated roles
- Emergency response to security incidents
- Role decommissioning workflows

**Important Notes:**

- This is a destructive operation removing ALL permissions from a role
- After calling this, users with this role will have no permissions
- Consider this as equivalent to "disabling" a role
- Ensure proper authorization checks before calling
- Log this operation for audit trail
- May require invalidating all sessions for users with this role
- Consider a confirmation step in the UI before executing

---

## Database Schema

The `role_permissions` table structure:

| Column       | Type      | Description                                                  |
| ------------ | --------- | ------------------------------------------------------------ |
| `id`         | UUID      | Primary key                                                  |
| `role`       | ENUM      | Role identifier (admin, moderator, user, etc.)               |
| `permission` | VARCHAR   | Permission identifier (e.g., 'create:posts', 'delete:users') |
| `created_at` | Timestamp | Creation timestamp                                           |
| `updated_at` | Timestamp | Last update timestamp                                        |

---

## Permission Naming Convention

For consistency and clarity, permissions should follow this naming pattern:

```text
<action>:<resource>[:<scope>]
```

**Examples:**

- `create:posts` - User can create posts
- `read:posts:own` - User can read only their own posts
- `edit:posts:own` - User can edit only their own posts
- `delete:users` - User can delete any user
- `manage:roles` - User can manage system roles
- `view:analytics` - User can view analytics dashboard
- `export:data` - User can export system data

---

## Permission Caching Strategy

For optimal performance, consider implementing a caching strategy:

```typescript
// Example: Cache permissions at app startup
interface PermissionCache {
    [role: string]: string[];
    lastFetch: number;
}

const permissionCache: PermissionCache = {
    lastFetch: 0,
};

export async function getCachedPermissionsByRole(role: Role) {
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    if (!permissionCache[role] || now - permissionCache.lastFetch > CACHE_TTL) {
        // Fetch fresh permissions
        const permissions = await getPermissionsByRoleAsync({ role });
        if (permissions) {
            permissionCache[role] = permissions;
            permissionCache.lastFetch = now;
        }
    }

    return permissionCache[role] || [];
}
```

---

## Error Handling Best Practices

All actions return `null` or `false` on error and log detailed information:

```typescript
// ✅ Good: Check return value and handle gracefully
const permissions = await getPermissionsByRoleAsync({ role: "moderator" });
if (!permissions) {
    console.error("Failed to load permissions");
    // Fall back to minimal permissions or redirect
    redirectToDefaultAccess();
    return;
}

// ✅ Good: Wrap destructive operations
try {
    const success = await deleteRolePermission({
        role: "moderator",
        permission: "edit:posts",
    });

    if (!success) {
        throw new Error("Failed to revoke permission");
    }
} catch (error) {
    logger.error("Permission revocation failed", error);
    toast.error("Failed to update permissions");
}
```

---

## Integration with Access Control System

These actions work in conjunction with:

- `user-role.ts` - Manage user role assignments
- `useUserPermissions()` hook - Client-side permission checking
- `useAuthStore` - Zustand store for authentication state
- `useAccessControl()` hook - Comprehensive access control checks

For a complete authorization flow:

1. Get user's role: `const role = await getUserRoleAsync()`
2. Fetch role permissions: `const permissions = await getPermissionsByRoleAsync({ role })`
3. Cache permissions for performance
4. Check specific permissions in components: `if (permissions.includes('create:posts'))`
5. Log all permission-based actions for audit trail

---

## See Also

- [User Role Actions](./user-role.md)
- [Authentication Documentation](../store.md)
