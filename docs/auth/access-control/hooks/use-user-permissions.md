# useUserPermissions()

A custom hook that provides utilities for managing and checking user permissions based on the user's role.

## Description

`useUserPermissions` is a client-side hook that integrates with the access control system. It consumes user role information from `useUserRoleStore` and permission definitions from `usePermissionsStore`, providing a convenient interface for permission checks throughout the application.

This hook is essential for building permission-aware UI components that show or hide features based on the user's current permissions.

## Signature

```typescript
export const useUserPermissions = () => {
  permissions: string[];
  hasPermission: (params: { readonly permission: string }) => boolean;
  hasAnyPermission: (params: { readonly permissions: readonly string[] }) => boolean;
  hasAllPermissions: (params: { readonly permissions: readonly string[] }) => boolean;
}
```

## Return Value

An object containing the following utilities:

| Property            | Type       | Description                                                          |
| ------------------- | ---------- | -------------------------------------------------------------------- |
| `permissions`       | `string[]` | Array of all permission strings available to the user's current role |
| `hasPermission`     | Function   | Check if the user has a specific permission                          |
| `hasAnyPermission`  | Function   | Check if the user has at least one of multiple permissions           |
| `hasAllPermissions` | Function   | Check if the user has all of multiple permissions                    |

## Methods

### `hasPermission()`

Check if the user has a specific permission.

**Parameters:**

- `permission` (string) - The permission identifier to check (e.g., 'edit:posts', 'delete:users')

**Returns:** `boolean` - `true` if the user has the permission, `false` otherwise

**Example:**

```typescript
const { hasPermission } = useUserPermissions();

if (hasPermission({ permission: "edit:posts" })) {
    // Show edit button
}
```

### `hasAnyPermission()`

Check if the user has at least one of the specified permissions.

**Parameters:**

- `permissions` (string[]) - Array of permission identifiers to check

**Returns:** `boolean` - `true` if the user has at least one permission, `false` otherwise

**Example:**

```typescript
const { hasAnyPermission } = useUserPermissions();

if (
    hasAnyPermission({
        permissions: ["view:analytics", "export:data", "manage:reports"],
    })
) {
    // Show analytics section
}
```

### `hasAllPermissions()`

Check if the user has all of the specified permissions.

**Parameters:**

- `permissions` (string[]) - Array of permission identifiers to check

**Returns:** `boolean` - `true` if the user has all permissions, `false` otherwise

**Example:**

```typescript
const { hasAllPermissions } = useUserPermissions();

if (
    hasAllPermissions({
        permissions: ["create:users", "manage:roles", "delete:users"],
    })
) {
    // Show admin control panel
}
```

## Usage Examples

### Basic Permission Check

```typescript
import { useUserPermissions } from '@/features/auth/access-control/hooks/use-user-permissions';

export function EditPostButton() {
  const { hasPermission } = useUserPermissions();

  if (!hasPermission({ permission: 'edit:posts' })) {
    return null; // Don't render if user can't edit
  }

  return (
    <button onClick={handleEdit}>
      Edit Post
    </button>
  );
}
```

### Multiple Permission Checks

```typescript
export function DataExportPanel() {
  const { hasAnyPermission, hasAllPermissions } = useUserPermissions();

  // Show export button if user can export OR create reports
  const canExport = hasAnyPermission({
    permissions: ['export:data', 'create:reports']
  });

  // Show advanced features only if user has all admin permissions
  const isFullAdmin = hasAllPermissions({
    permissions: ['create:users', 'manage:roles', 'delete:users', 'view:logs']
  });

  return (
    <>
      {canExport && <ExportButton />}
      {isFullAdmin && <AdvancedAdminPanel />}
    </>
  );
}
```

### Accessing Raw Permissions

```typescript
export function PermissionsList() {
  const { permissions } = useUserPermissions();

  return (
    <div>
      <h3>Your Permissions:</h3>
      <ul>
        {permissions.map(perm => (
          <li key={perm}>{perm}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Conditional Rendering

```typescript
export function AdminDashboard() {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  } = useUserPermissions();

  return (
    <div className="dashboard">
      {hasPermission({ permission: 'view:users' }) && (
        <UsersPanel />
      )}

      {hasAnyPermission({
        permissions: ['manage:classrooms', 'manage:enrollments']
      }) && (
        <ClassroomManagement />
      )}

      {hasAllPermissions({
        permissions: ['create:jobs', 'manage:jobs', 'delete:jobs']
      }) && (
        <JobManagement />
      )}
    </div>
  );
}
```

## Important Notes

### Client-Side Only

This hook provides **client-side permission checking** for UI purposes. Always verify permissions server-side before executing sensitive operations:

```typescript
// ✅ Good: Client-side check for UI
export function EditButton() {
  const { hasPermission } = useUserPermissions();

  if (!hasPermission({ permission: 'edit:posts' })) {
    return null;
  }

  return <button onClick={handleEdit}>Edit</button>;
}

// ✅ Good: Server-side verification
"use server"
export async function updatePostAsync(postId: string, data: PostData) {
  // Always verify permission on server
  const userRole = await getUserRoleAsync();
  const permissions = await getPermissionsByRoleAsync({ role: userRole });

  if (!permissions.includes('edit:posts')) {
    throw new Error('Unauthorized');
  }

  // Proceed with update...
}
```

### No Throw on Error

The hook does not throw errors. If the user is not authenticated or the role is not found:

- `permissions` will be an empty array
- All permission check functions will return `false`

```typescript
const { hasPermission, permissions } = useUserPermissions();

// If user is not authenticated:
console.log(permissions); // []
console.log(hasPermission({ permission: "any:permission" })); // false
```

### Permission Naming Convention

Permissions follow the pattern: `<action>:<resource>[:<scope>]`

Common examples:

- `create:posts` - User can create posts
- `edit:posts:own` - User can edit only their own posts
- `delete:users` - User can delete any user
- `manage:roles` - User can manage system roles
- `view:analytics` - User can view analytics dashboard

### Performance Considerations

- Results are computed from current store state
- No caching is performed by the hook itself
- For performance-critical scenarios, consider caching results in your component state
- Avoid calling this hook in deeply nested components; prefer passing results down as props

## Related Hooks & Stores

- `useUserRoleStore` - Access current user's role information
- `usePermissionsStore` - Low-level permission storage and utilities

## Related Server Actions

- `getUserRoleAsync()` - Get user's role from session
- `getPermissionsByRoleAsync()` - Fetch permissions for a role

## Error Scenarios

### Unauthenticated User

```typescript
const { hasPermission, permissions } = useUserPermissions();

// When user is not logged in:
// permissions = []
// hasPermission({ permission: 'any:permission' }) = false
```

### User Role Not Found

```typescript
// When user role cannot be retrieved:
// permissions = []
// hasPermission({ permission: 'any:permission' }) = false
```

## Best Practices

1. **Check permissions before rendering expensive components**

    ```typescript
    const { hasPermission } = useUserPermissions();

    if (!hasPermission({ permission: 'access:premium' })) {
      return <UpgradePrompt />;
    }
    ```

2. **Use `hasAnyPermission` for feature toggles**

    ```typescript
    if (hasAnyPermission({ permissions: ['feature:beta', 'role:admin'] })) {
      return <BetaFeature />;
    }
    ```

3. **Always verify on the server for sensitive operations**

    ```typescript
    // Client-side check
    const { hasPermission } = useUserPermissions();

    async function handleDelete() {
        if (!hasPermission({ permission: "delete:posts" })) {
            toast.error("Permission denied");
            return;
        }

        // Server-side action with its own verification
        await deletePostAsync(postId);
    }
    ```

4. **Combine with role guards for complete protection**

    ```typescript
    export function AdminPage() {
      const { hasPermission } = useUserPermissions();

      return (
        <RoleGuard roles={['admin']}>
          {hasPermission({ permission: 'manage:system' }) && (
            <SystemPanel />
          )}
        </RoleGuard>
      );
    }
    ```

## See Also

- [User Role Actions](../actions/user-role.md)
- [Role Permissions Actions](../actions/role-permissions.md)
- [Access Control Overview](../../)
