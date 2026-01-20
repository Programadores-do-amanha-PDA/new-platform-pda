# User Authentication Actions

Server-side actions for managing user authentication state and session operations. These are "use server" functions that must be called from client components.

## Overview

The user actions module (`user.ts`) provides Server Actions for:

- **User Profile Updates**: Modify authenticated user information (email, password, metadata)
- **Session Management**: Set and manage authentication sessions
- **Logout Operations**: Sign out users and clear sessions

All functions in this module use the `"use server"` directive and run exclusively on the server.

## Functions

### `updateAuthUser({ updates })`

Updates the authenticated user's information in Supabase Auth. Allows modifying email, password, and user metadata.

**Location**: `src/features/shared/auth/actions/user.ts`

**Server Action**: Yes (`"use server"`)

**Parameters**:

- `updates: Partial<UserAuthLoginT>` - Partial user data to update. Supported fields:
    - `email: string` - New email address
    - `password: string` - New password
    - `data: Record<string, any>` - Custom user metadata
    - Other Supabase auth fields

**Returns**: `Promise<UpdateAuthUserResultT>`

An object containing:

- `user: AuthUser | null` - Updated user object if successful, null on error
- `error: string | null` - Error message if failed, null on success

**Error Handling**: Errors are caught, logged, and returned (never thrown)

**Example**:

```typescript
import { updateAuthUser } from "@/features/shared/auth/actions/user";

// Update email
const { user, error } = await updateAuthUser({
    updates: { email: "newemail@example.com" },
});

if (error) {
    console.log("Failed to update email:", error);
    return;
}

console.log("Email updated for user:", user?.id);
```

**Full Update Example**:

```typescript
const { user, error } = await updateAuthUser({
    updates: {
        email: "newemail@example.com",
        password: "newSecurePassword123",
        data: {
            firstName: "John",
            lastName: "Doe",
            phone: "+5511999999999",
        },
    },
});
```

**What it does**:

1. Validates that updates were provided
2. Initializes Supabase server client
3. Calls `supabase.auth.updateUser()`
4. Returns updated user or error

**Use Cases**:

- Allow users to update their email
- Change password
- Update profile metadata
- Sync user data with backend

---

### `setSession({ access_token, refresh_token })`

Establishes a user session with provided access and refresh tokens. Used after authentication flows that return tokens.

**Location**: `src/features/shared/auth/actions/user.ts`

**Server Action**: Yes (`"use server"`)

**Parameters**:

- `access_token: string` - The JWT access token for authentication
- `refresh_token: string` - The refresh token for session renewal

**Returns**: `Promise<SetSessionResultT>`

An object containing:

- `session: Session | null` - Authenticated session if successful, null on error
- `error: string | null` - Error message if failed, null on success

**Error Handling**: Errors are caught, logged, and returned (never thrown)

**Example**:

```typescript
import { setSession } from "@/features/shared/auth/actions/user";
import { useAuthStore } from "@/features/shared/auth";

// After OAuth login or token exchange
const { session, error } = await setSession({
    access_token: "eyJhbGc...",
    refresh_token: "eyJhbGc...",
});

if (error) {
    console.log("Failed to set session:", error);
    return;
}

// Sync store with new session
const { updateAuthState } = useAuthStore.getState();
await updateAuthState({ session });
```

**What it does**:

1. Validates both tokens are provided
2. Initializes Supabase server client
3. Calls `supabase.auth.setSession()`
4. Returns session or error

**Use Cases**:

- Establish session after OAuth authentication
- Set up session from external auth provider
- Re-authenticate with refresh token
- Initialize session from stored tokens

---

### `signOut()`

Signs out the currently authenticated user from Supabase and clears the session.

**Location**: `src/features/shared/auth/actions/user.ts`

**Server Action**: Yes (`"use server"`)

**Parameters**: None

**Returns**: `Promise<boolean>`

- `true` if sign-out was successful
- `false` if an error occurred

**Error Handling**: Errors are caught and logged internally, function returns `false` on failure

**Example**:

```typescript
import { signOut } from "@/features/shared/auth/actions/user";
import { useAuthStore } from "@/features/shared/auth";

export async function handleLogout() {
    const success = await signOut();

    if (!success) {
        console.log("Sign-out failed");
        // Still clear client state
    }

    // Reset auth store
    const { reset } = useAuthStore.getState();
    reset();

    // Redirect to login
    redirect("/sign-in");
}
```

**What it does**:

1. Initializes Supabase server client
2. Calls `supabase.auth.signOut()`
3. Returns success/failure boolean

**Use Cases**:

- Logout user on button click
- Clear server session
- Reset client state after logout
- Sign out on token expiry

---

## Type Definitions

### `UpdateAuthUserResultT`

Result type for user update operations.

```typescript
type UpdateAuthUserResultT = { user: AuthUser; error: null } | { user: null; error: string };
```

---

### `SetSessionResultT`

Result type for session operations.

```typescript
type SetSessionResultT = { session: Session; error: null } | { session: null; error: string };
```

---

## Complete Workflow Example

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAuthUser, signOut } from '@/features/shared/auth/actions/user';
import { useAuthStore } from '@/features/shared/auth';

export function UserSettingsForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateEmail = async () => {
    setLoading(true);
    try {
      const { user: updatedUser, error } = await updateAuthUser({
        updates: { email }
      });

      if (error) {
        alert(`Update failed: ${error}`);
        return;
      }

      alert('Email updated successfully');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const success = await signOut();

    if (!success) {
      alert('Sign-out failed, but clearing local state');
    }

    // Clear store and redirect
    const { reset } = useAuthStore.getState();
    reset();
    router.push('/sign-in');
  };

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleUpdateEmail} disabled={loading}>
        Update Email
      </button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

## Error Handling Pattern

```typescript
// Standard pattern used by all functions
try {
    // 1. Validate inputs
    if (!input) throw new Error("Missing required input");

    // 2. Get server client
    const supabase = await createClient();
    if (!supabase) throw new Error("Client initialization failed");

    // 3. Call API
    const { data, error } = await supabase.auth.method();
    if (error) throw error;

    // 4. Return success
    return { resource: data, error: null };
} catch (error) {
    // 5. Log error
    log.error({ err: error, operation: "operationName" }, "Error message");

    // 6. Return error
    return {
        resource: null,
        error: error instanceof Error ? error.message : "unknown error",
    };
}
```

---

## Security Considerations

- **Server-side execution**: All operations run on the server, never exposing credentials to client
- **Token handling**: Tokens are only handled in server context
- **Session validation**: Sessions are validated server-side before use
- **Error logging**: Sensitive errors are logged but not exposed to client
- **CORS protection**: Operations are protected by Next.js server middleware

---

## Integration with Auth Store

All user actions should be synchronized with the auth store:

```typescript
import { useAuthStore } from "@/features/shared/auth";
import { updateAuthUser } from "@/features/shared/auth/actions/user";

// Update user and sync store
const { user, error } = await updateAuthUser({ updates });
if (!error) {
    const { setUser } = useAuthStore.getState();
    setUser({ user });
}
```

---

## Logging

All operations are logged using the application's logger:

```typescript
const log = logger.child({ module: "UserAuthActions" });

log.error({ err: error, operation: "updateAuthUser" }, "Error updating auth user");
log.warn({ operation: "signOut" }, "User signed out");
```

---

## Dependencies

- **@supabase/supabase-js**: Auth client types
- **@/lib/supabase/server**: Server-side Supabase client
- **@/lib/logger**: Application logger
- **@/features/dashboard/shared/users-management/types**: User type definitions

---

## See Also

- [Auth Utils](./utils.md) - Low-level authentication utilities
- [OAuth Actions](./oauth.md) - OAuth and OTP operations
- [Auth Store](../store.md) - Client-side auth state management
