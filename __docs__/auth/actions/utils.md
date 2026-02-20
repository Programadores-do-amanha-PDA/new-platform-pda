# Authentication Utilities

Low-level authentication utilities for interacting with Supabase authentication API and JWT tokens.

## Overview

The utilities module (`utils.ts`) provides core authentication functions for:

- **JWT Validation**: Extract and validate JWT tokens
- **Session Management**: Retrieve and manage Supabase sessions
- **User Retrieval**: Fetch authenticated user data

These are foundational functions used by higher-level services and the auth store.

## Functions

### `getAuthUserByJWT({ jwt })`

Retrieves the authenticated user information from a JWT token without making an API call.

**Location**: `src/features/shared/auth/actions/utils.ts`

**Parameters**:

- `jwt: string` - JWT token to validate and extract user data from

**Returns**: `Promise<GetAuthUserByJWTResultT>`

A promise resolving to an object containing:
- `user: AuthUser | null` - The authenticated user object if successful, null on error
- `error: string | null` - Error message if failed, null on success

**Error Handling**: Errors are caught and returned in the result object, never thrown

**Example**:
```typescript
import { getAuthUserByJWT } from '@/features/shared/auth/actions/utils';

const { user, error } = await getAuthUserByJWT({ jwt: accessToken });
if (error) {
  console.log('Failed to get user:', error);
  return;
}
console.log('User ID:', user?.id);
```

**What it does**:
1. Validates the JWT parameter is provided
2. Initializes Supabase client
3. Calls `supabase.auth.getUser(jwt)`
4. Returns user or error in result object

**Use Cases**:
- Validate JWT tokens on app initialization
- Extract user data from access tokens
- Verify token validity without additional API calls

---

### `getSession()`

Retrieves the current user session from the Supabase authentication client. This checks for any active session in the client context.

**Location**: `src/features/shared/auth/actions/utils.ts`

**Parameters**: None

**Returns**: `Promise<SetSessionResultT>`

A promise resolving to an object containing:
- `session: Session | null` - The authenticated session if found, null on error
- `error: string | null` - Error message if failed, null on success

**Error Handling**: Errors are caught and returned in the result object, never thrown

**Example**:
```typescript
import { getSession } from '@/features/shared/auth/actions/utils';

const { session, error } = await getSession();
if (error) {
  console.log('No active session:', error);
  return;
}
console.log('User email:', session?.user?.email);
```

**What it does**:
1. Initializes Supabase client
2. Calls `supabase.auth.getSession()`
3. Validates that a session was returned
4. Returns session or error in result object

**Use Cases**:
- Check if user has an active session on page load
- Retrieve session for authentication state initialization
- Verify user is logged in before making authenticated requests

---

## Type Definitions

### `GetAuthUserByJWTResultT`

Result type for JWT user retrieval operations.

```typescript
type GetAuthUserByJWTResultT =
  | {
      readonly user: AuthUser;
      readonly error: null;
    }
  | {
      readonly user: null;
      readonly error: string;
    };
```

**Usage**:
```typescript
const result = await getAuthUserByJWT({ jwt: token });
if (result.error) {
  // Handle error
  console.log(result.error);
} else {
  // Use user data
  console.log(result.user.id);
}
```

---

### `SetSessionResultT`

Result type for session retrieval operations.

```typescript
type SetSessionResultT =
  | {
      readonly session: Session;
      readonly error: null;
    }
  | {
      readonly session: null;
      readonly error: string;
    };
```

**Usage**:
```typescript
const result = await getSession();
if (result.error) {
  // Handle error
  console.log(result.error);
} else {
  // Use session data
  console.log(result.session.access_token);
}
```

---

## Error Patterns

All functions follow a consistent error handling pattern:

```typescript
try {
  // Validate inputs
  if (!input) throw new Error('Input validation failed');
  
  // Initialize client
  const supabase = await createClient();
  if (!supabase) throw new Error('Client initialization failed');
  
  // Call API
  const { data, error } = await supabase.auth.method();
  if (error) throw error;
  
  // Return success
  return { resource: data, error: null };
} catch (error) {
  // Log error
  console.error('Operation failed:', error);
  
  // Return error
  return {
    resource: null,
    error: error instanceof Error ? error.message : 'unknown error'
  };
}
```

**Benefits**:
- Errors never propagate to callers (functions don't throw)
- Consistent return type for all operations
- Error messages are user-friendly strings
- Errors are logged for debugging

---

## Common Patterns

### Pattern 1: Check Session and Get User

```typescript
import { getSession, getAuthUserByJWT } from '@/features/shared/auth/actions/utils';

export async function getCurrentUser() {
  const { session, error: sessionError } = await getSession();
  
  if (sessionError || !session) {
    return null; // Not authenticated
  }
  
  const { user, error: userError } = await getAuthUserByJWT({
    jwt: session.access_token
  });
  
  if (userError) {
    return null; // Failed to get user
  }
  
  return user;
}
```

### Pattern 2: Validate Token Expiry

```typescript
import { getAuthUserByJWT } from '@/features/shared/auth/actions/utils';
import { jwtDecode } from 'jwt-decode';

export async function isTokenValid(token: string) {
  // Check JWT expiry
  const decoded = jwtDecode(token);
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    return false; // Token expired
  }
  
  // Verify with Supabase
  const { error } = await getAuthUserByJWT({ jwt: token });
  return !error;
}
```

### Pattern 3: Initialize Auth on App Load

```typescript
import { useAuthStore } from '@/features/shared/auth';
import { getSession } from '@/features/shared/auth/actions/utils';

export async function initializeAuth() {
  const { session } = await getSession();
  const { updateAuthState } = useAuthStore.getState();
  
  return updateAuthState({ session });
}
```

---

## Performance Considerations

- `getAuthUserByJWT` does NOT make API calls (uses `getUser()` which is sync)
- `getSession` makes a single API call to Supabase
- Both functions are cached by the Supabase client when possible
- Use `getAuthUserByJWT` for fast token validation
- Use `getSession` for checking active sessions

---

## Security Notes

- JWT tokens should be treated as sensitive data
- Never log full tokens in production
- Always validate token expiry before using
- Check user permissions after retrieving user data
- Use HTTPS for all token transmission

---

## Dependencies

- **@supabase/supabase-js**: Supabase auth client
- **jwt-decode**: JWT token decoding
- **@/lib/supabase/client**: Custom Supabase client factory

---

## See Also

- [User Actions](./user.md) - Higher-level user authentication operations
- [OAuth Actions](./oauth.md) - OAuth and OTP verification
- [Auth Store](../store.md) - State management for authentication
