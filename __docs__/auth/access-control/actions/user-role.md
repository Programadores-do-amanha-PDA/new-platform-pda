# User Role Actions

Server-side actions for managing user role assignments and retrieval. These functions handle all operations related to associating users with roles and retrieving role information from the authentication system.

## Overview

User roles are the foundation of the application's access control system. A user can have one or more roles that determine what features and data they can access. These actions provide a clean interface for managing the `user_roles` table in the database.

## Actions

### `insertUserRoleWithUserIdAsync()`

Inserts a new role assignment for a specific user.

**Parameters:**

- `userId` (string) - The unique identifier of the user
- `role` (Role) - The role to assign to the user

**Returns:**

- `Promise<UserRole[] | null>` - Array of user roles after insertion, or null on error

**Error Handling:**

- Returns `null` if userId or role is invalid
- Returns `null` if Supabase client is not initialized
- Logs detailed error information with operation context

**Example:**

```typescript
const result = await insertUserRoleWithUserIdAsync({
    userId: "user-123",
    role: "admin",
});

if (result) {
    console.log("Role assigned successfully:", result);
} else {
    console.error("Failed to assign role");
}
```

**Use Cases:**

- Adding a new role to a user during registration
- Assigning additional roles to existing users
- Promoting users to higher privilege levels

---

### `getAllUserRolesAsync()`

Retrieves all user role assignments from the system.

**Parameters:**

- None

**Returns:**

- `Promise<UserRole[] | null>` - Array of all user-role associations, or null on error

**Error Handling:**

- Returns `null` if Supabase client is not initialized
- Logs error details when database query fails

**Example:**

```typescript
const allRoles = await getAllUserRolesAsync();

if (allRoles) {
    console.log(`Total role assignments: ${allRoles.length}`);

    // Group by role
    const roleGroups = allRoles.reduce(
        (acc, curr) => {
            if (!acc[curr.role]) acc[curr.role] = [];
            acc[curr.role].push(curr.user_id);
            return acc;
        },
        {} as Record<string, string[]>,
    );
} else {
    console.error("Failed to fetch all user roles");
}
```

**Use Cases:**

- Administrative dashboards showing role distribution
- Auditing and compliance reporting
- Generating role statistics
- Data export and analysis

---

### `getUserRoleAsync()`

Retrieves the current user's role from their active session.

**Parameters:**

- None (uses current session context)

**Returns:**

- `Promise<string | null>` - The user's role, or null on error

**Error Handling:**

- Returns `null` if no active session exists
- Returns `null` if JWT decoding fails
- Returns `null` if user role claim is missing from token
- Logs detailed error information

**Example:**

```typescript
const userRole = await getUserRoleAsync();

if (userRole) {
    switch (userRole) {
        case "admin":
            // Show admin features
            break;
        case "moderator":
            // Show moderator features
            break;
        case "user":
            // Show standard user features
            break;
        default:
        // Handle unknown role
    }
} else {
    // Redirect to login or show error
}
```

**Use Cases:**

- Determining current user's permission level
- Controlling conditional rendering based on role
- Authorization checks in Server Actions
- Audit logging of user actions by role

**Important Notes:**

- Requires an active user session
- Extracts role from JWT token (not real-time from database)
- For real-time permission checks, use `getPermissionsByRoleAsync()` from role-permissions actions
- Call this once at app initialization and cache the result when possible

---

### `updateUserRoleWithUserIdAsync()`

Updates a user's role assignment to a new role.

**Parameters:**

- `userId` (string) - The unique identifier of the user
- `newRole` (Role) - The new role to assign

**Returns:**

- `Promise<UserRole[] | null>` - Array of updated user roles, or null on error

**Error Handling:**

- Returns `null` if userId or newRole is invalid
- Returns `null` if Supabase client is not initialized
- Returns `null` if user record is not found
- Logs operation details for audit trail

**Example:**

```typescript
// Promote a moderator to admin
const result = await updateUserRoleWithUserIdAsync({
    userId: "user-456",
    newRole: "admin",
});

if (result) {
    console.log("User promoted successfully");
    // Optionally trigger audit log entry
    logAuditEvent("USER_ROLE_CHANGED", {
        userId: "user-456",
        newRole: "admin",
    });
} else {
    console.error("Failed to update user role");
}
```

**Use Cases:**

- Changing user permission levels
- Promoting users to higher roles
- Demoting users due to policy violations
- Administrative role reassignments

**Important Notes:**

- This replaces the entire role with a new one
- For revoking all roles, use `deleteUserRoleWithUserIdAsync()`
- Consider audit logging all role changes
- May require re-authentication or JWT token refresh for permission updates to take effect

---

### `deleteUserRoleWithUserIdAsync()`

Removes all role assignments for a specific user.

**Parameters:**

- `userId` (string) - The unique identifier of the user

**Returns:**

- `Promise<boolean>` - `true` if deletion was successful, `false` on error

**Error Handling:**

- Returns `false` if userId is invalid
- Returns `false` if Supabase client is not initialized
- Returns `false` if user record is not found
- Logs error context for debugging

**Example:**

```typescript
// Revoke all roles from a user
const success = await deleteUserRoleWithUserIdAsync({ userId: "user-789" });

if (success) {
    console.log("All user roles removed successfully");

    // Trigger user session invalidation
    await invalidateUserSessions("user-789");
} else {
    console.error("Failed to remove user roles");
}
```

**Use Cases:**

- Disabling user accounts
- Suspending user access
- Account deletion workflows
- Revoking all permissions during offboarding

**Important Notes:**

- This removes ALL roles from the user
- After calling this, the user will have no permissions
- Consider invalidating active sessions after role removal
- This is typically a destructive operation—consider audit logging
- May require additional steps like session invalidation to take effect immediately

---

## Database Schema

The `user_roles` table structure:

| Column       | Type      | Description                                    |
| ------------ | --------- | ---------------------------------------------- |
| `id`         | UUID      | Primary key                                    |
| `user_id`    | UUID      | Foreign key to users table                     |
| `role`       | ENUM      | Role identifier (admin, moderator, user, etc.) |
| `created_at` | Timestamp | Creation timestamp                             |
| `updated_at` | Timestamp | Last update timestamp                          |

---

## Error Handling Best Practices

All actions return `null` or `false` on error and log detailed information. When consuming these actions:

```typescript
// ✅ Good: Check return value and handle gracefully
const result = await insertUserRoleWithUserIdAsync({ userId, role });
if (!result) {
    // Show user-friendly error message
    toast.error("Failed to assign role. Please try again.");
    return;
}

// ✅ Good: Wrap in try-catch for additional safety
try {
    const userRole = await getUserRoleAsync();
    if (!userRole) {
        redirectToLogin();
        return;
    }
    // Use userRole...
} catch (error) {
    logger.error("Unexpected error retrieving user role", error);
}
```

---

## Integration with Access Control System

These actions work in conjunction with:

- `role-permissions.ts` - Get permissions for a specific role
- `useUserPermissions` hook - Client-side permission checking
- `useAuthStore` - Zustand store for authentication state
- JWT tokens - Role claim is embedded in auth tokens

For a complete permission check flow:

1. Use `getUserRoleAsync()` to get the user's current role
2. Use `getPermissionsByRoleAsync()` to get all permissions for that role
3. Check specific permissions with `useUserPermissions()` hook in components

---

## See Also

- [Role Permissions Actions](./role-permissions.md)
- [Authentication Documentation](../store.md)
