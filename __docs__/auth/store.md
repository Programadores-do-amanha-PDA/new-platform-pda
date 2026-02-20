# Authentication Store

Zustand store for managing user authentication state and session operations.

## Overview

The `useAuthStore` is the single source of truth for the application's authentication state. It manages:

- **User State**: Stores authenticated user data
- **Session Management**: Manages JWT tokens and Supabase sessions
- **Loading States**: Tracks the progress of asynchronous operations
- **Time-Travel Debugging**: Integrated with Zustand devtools for debugging

## State

### `user: AuthUser | null`

The currently authenticated user or `null` if not authenticated.

**Type**: `AuthUser` (Supabase type)

```typescript
// User not authenticated
user === null;

// User authenticated
user?.id; // User ID
user?.email; // User email
user?.user_metadata; // Custom metadata
```

### `loading: boolean`

Loading state indicator for asynchronous operations.

```typescript
if (loading) {
  return <Loader />; // Showing spinner
}
```

## Actions

### `setUser({ user })`

Sets the current user directly in the store. Useful for manual updates.

**Parameters**:

- `user: AuthUser | null` - The user to set in the state (null to clear)

**Returns**: `void`

**Example**:

```typescript
const { setUser } = useAuthStore();

// Clear user
setUser({ user: null });

// Set authenticated user
setUser({ user: authUser });
```

---

### `fetchUserByJWT({ jwt })`

Fetches and sets user information from a JWT token. Decodes the JWT and retrieves user data from the authentication service.

**Parameters**:

- `jwt: string` - JWT token containing user information

**Returns**: `Promise<boolean>` - `true` if successful, `false` otherwise

**Error Handling**: Errors are caught and logged, returning `false` instead of throwing an exception

**Example**:

```typescript
const { fetchUserByJWT } = useAuthStore();

const success = await fetchUserByJWT({ jwt: accessToken });
if (!success) {
    console.log("Failed to authenticate with JWT");
    // Redirect to login
}
```

**What it does**:

1. Validates that the JWT was provided
2. Sets `loading: true`
3. Decodes the JWT
4. Fetches user data
5. Updates the store with user data
6. Sets `loading: false`
7. Returns success/failure

---

### `updateAuthState({ session })`

Updates authentication state based on a Supabase session object. Extracts the JWT from the session and fetches user data accordingly. If the session is null or invalid, resets the authentication state.

**Parameters**:

- `session: Session | null` - Supabase session object containing `access_token`

**Returns**: `Promise<boolean>` - `true` if successful, `false` otherwise

**Example**:

```typescript
import { supabase } from "@/lib/supabase";
const { updateAuthState } = useAuthStore();

// Get current session and update store
const { data } = await supabase.auth.getSession();
const success = await updateAuthState({ session: data.session });
```

**Edge Cases**:

```typescript
// Null session - resets state
updateAuthState({ session: null });

// Invalid session - resets state
updateAuthState({ session: expiredSession });
```

---

### `fetchSession()`

Fetches the current user session from Supabase and updates authentication state. This is the primary method for initializing authentication on app load.

**Parameters**: None

**Returns**: `Promise<boolean>` - `true` if session found and user authenticated, `false` otherwise

**Example**:

```typescript
import { useAuthStore } from '@/features/shared/auth';
import { useEffect } from 'react';

export const RootLayout = ({ children }) => {
  useEffect(() => {
    const initializeAuth = async () => {
      const { fetchSession } = useAuthStore.getState();
      const success = await fetchSession();

      if (!success) {
        console.log('User not authenticated');
        // Redirect to login if necessary
      }
    };

    initializeAuth();
  }, []);

  return <>{children}</>;
};
```

**Use Cases**:

- Initialize authentication on app load
- Check if user is still authenticated after page refresh
- Re-sync state after returning from background

---

### `reset()`

Resets authentication state to initial state (null user, loading: true). Used when user logs out or authentication fails.

**Parameters**: None

**Returns**: `void`

**Example**:

```typescript
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/shared/auth";

export const useLogout = () => {
    const { reset } = useAuthStore();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (!error) {
            reset(); // Clear store
        }
    };

    return { handleLogout };
};
```

---

## Usage Patterns

### 1. Initialize Authentication (App Load)

```typescript
import { useAuthStore } from '@/features/shared/auth';
import { useEffect } from 'react';

export function RootLayout() {
  const { fetchSession, loading, user } = useAuthStore();

  useEffect(() => {
    fetchSession();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {user ? <Dashboard /> : <Login />}
    </div>
  );
}
```

### 2. Use Authenticated State in Components

```typescript
import { useAuthStore } from '@/features/shared/auth';

export function UserMenu() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
    </div>
  );
}
```

### 3. Logout

```typescript
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/shared/auth';

export function LogoutButton() {
  const { reset } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    reset();
    // Redirect to home
  };

  return <button onClick={handleLogout}>Sign out</button>;
}
```

### 4. Authenticate with OAuth/Email

```typescript
import { useAuthStore } from '@/features/shared/auth';

export function SignInForm() {
  const { fetchSession } = useAuthStore();

  const handleSignIn = async (email: string, password: string) => {
    // Sign in with Supabase
    // ...

    // Sync state
    const success = await fetchSession();
    if (success) {
      // User authenticated!
    }
  };

  return (
    // Form JSX
  );
}
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           React Component                   │
│  const { user, fetchSession } = ...         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         useAuthStore (Zustand)              │
│  State: user, loading                       │
│  Actions: fetchSession, setUser, etc.       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Authentication Actions                     │
│  (src/features/shared/auth/actions/)        │
│  utils.ts, user.ts, oauth.ts                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         Supabase Client                     │
│  JWT tokens, Auth API, etc.                 │
└─────────────────────────────────────────────┘
```

---

## API Reference

### Store Exports

```typescript
// src/features/shared/auth/index.ts
export const useAuthStore; // Zustand hook
export { AuthState, AuthActions }; // Types
```

### Dependencies

- **zustand**: State management
- **@supabase/supabase-js**: Auth client
- **jwt-decode**: JWT decoding
- **@/lib/logger**: Logging

---

## Error Handling

The store implements robust error handling:

```typescript
// Errors in fetchUserByJWT
- Invalid/expired JWT
- User not found
- Network errors

// Result: false returned, error logged
// Store remains safe
```

All errors are logged via logger for production debugging.

---

## Performance Considerations

- Store uses `devtools` middleware for time-travel debugging
- Each action is atomic and thread-safe
- Loading state prevents race conditions
- State is persisted only if necessary (not persisted by default)

---

## Testing

```typescript
import { useAuthStore } from "@/features/shared/auth";
import { renderHook, act } from "@testing-library/react";

test("setUser updates the user", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
        result.current.setUser({ user: mockUser });
    });

    expect(result.current.user).toBe(mockUser);
});
```

---

## See Also

- [Auth Actions - User](./actions/user.md)
- [Auth Actions - OAuth](./actions/oauth.md)
- [Auth Actions - Utils](./actions/utils.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
