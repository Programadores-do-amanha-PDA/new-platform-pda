# OAuth and OTP Authentication Actions

Client-side actions for handling OAuth flows and One-Time Password (OTP) verification. These functions manage external authentication providers and token-based verification.

## Overview

The OAuth actions module (`oauth.ts`) provides functions for:

- **OTP Verification**: Verify one-time passwords sent via email or other channels
- **OAuth Token Exchange**: Handle OAuth provider callbacks
- **Session Creation**: Establish sessions from verified tokens

These are client-side operations that interact with Supabase OAuth and passwordless auth flows.

## Functions

### `verifyOtp({ tokenHash, type })`

Verifies an One-Time Password (OTP) using the provided token hash and type. Used in email verification and passwordless login flows.

**Location**: `src/features/shared/auth/actions/oauth.ts`

**Parameters**:

- `tokenHash: string` - The hash of the OTP token sent to the user (from URL or email)
- `type: EmailOtpType` - The type of OTP verification. Common values:
    - `"email"` - Email verification
    - `"magiclink"` - Magic link authentication
    - `"invite"` - Invitation verification

**Returns**: `Promise<VerifyOtpResults>`

An object containing:

- `session?: Session` - Authenticated session if verification succeeded
- `user?: User` - Authenticated user information if verification succeeded
- `error?: AuthError | Error` - Error object if verification failed

**Error Handling**: Errors are caught and logged, returned in result object (never thrown)

**Example**:

```typescript
import { verifyOtp } from "@/features/shared/auth/actions/oauth";
import { useAuthStore } from "@/features/shared/auth";

// Extract token hash from URL (e.g., /verify?token_hash=xxx)
const tokenHash = new URLSearchParams(window.location.search).get("token_hash");

const result = await verifyOtp({
    tokenHash,
    type: "email",
});

if (result.error) {
    console.log("OTP verification failed:", result.error.message);
    return;
}

// Verify successful - sync auth store
const { updateAuthState } = useAuthStore.getState();
await updateAuthState({ session: result.session });
```

**What it does**:

1. Validates tokenHash and type parameters
2. Initializes Supabase client
3. Calls `supabase.auth.verifyOtp()`
4. Returns session and user or error

**Use Cases**:

- Email verification during signup
- Magic link login
- Invitation acceptance
- Password reset verification

---

## Type Definitions

### `VerifyOtpResults`

Result type for OTP verification operations.

```typescript
type VerifyOtpResults = {
    session?: Session;
    user?: User;
    error?: AuthError | Error;
};
```

**Usage**:

```typescript
const result = await verifyOtp({ tokenHash, type: "email" });

if (result.error) {
    // Handle error
    console.log("Error:", result.error.message);
} else if (result.session) {
    // Use session and user
    console.log("User:", result.user?.email);
    console.log("Token:", result.session.access_token);
}
```

---

## OAuth Workflows

### Workflow 1: Email Verification Flow

```
User Email Verification Process:
│
├─ 1. User signs up with email
├─ 2. Supabase sends verification email with token_hash
├─ 3. User clicks verification link
│   └─ URL: /verify?token_hash=xxx
├─ 4. Call verifyOtp({ tokenHash, type: 'email' })
├─ 5. Verify successful → Session established
└─ 6. User authenticated and verified
```

**Implementation**:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp } from '@/features/shared/auth/actions/oauth';
import { useAuthStore } from '@/features/shared/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateAuthState } = useAuthStore();

  useEffect(() => {
    const verifyEmail = async () => {
      const tokenHash = searchParams.get('token_hash');

      if (!tokenHash) {
        router.push('/sign-in');
        return;
      }

      const result = await verifyOtp({
        tokenHash,
        type: 'email'
      });

      if (result.error) {
        // Verification failed
        console.error('Verification failed:', result.error.message);
        router.push('/verify-error');
        return;
      }

      // Verification successful
      await updateAuthState({ session: result.session });
      router.push('/dashboard');
    };

    verifyEmail();
  }, [searchParams, router, updateAuthState]);

  return <div>Verifying email...</div>;
}
```

---

### Workflow 2: Magic Link Login

```
Magic Link Authentication:
│
├─ 1. User enters email on login page
├─ 2. Send magic link via email
├─ 3. Email contains link: /auth/callback?token_hash=xxx
├─ 4. User clicks link
├─ 5. Call verifyOtp({ tokenHash, type: 'magiclink' })
├─ 6. Session created automatically
└─ 7. User logged in without password
```

**Implementation**:

```typescript
'use client';

import { verifyOtp } from '@/features/shared/auth/actions/oauth';
import { useAuthStore } from '@/features/shared/auth';

export function MagicLinkCallback() {
  const params = new URLSearchParams(window.location.search);
  const tokenHash = params.get('token_hash');

  const handleMagicLink = async () => {
    const result = await verifyOtp({
      tokenHash,
      type: 'magiclink'
    });

    if (result.error) {
      console.error('Magic link verification failed:', result.error);
      return;
    }

    // Sync store with session
    const { updateAuthState } = useAuthStore.getState();
    await updateAuthState({ session: result.session });

    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  return <button onClick={handleMagicLink}>Verify Login</button>;
}
```

---

### Workflow 3: Invitation Acceptance

```
Invitation Flow:
│
├─ 1. Admin creates user via email
├─ 2. Supabase sends invitation email
├─ 3. Invitation link contains token_hash
├─ 4. User clicks "Accept Invitation"
├─ 5. Call verifyOtp({ tokenHash, type: 'invite' })
├─ 6. User account activated
└─ 7. User can set password and login
```

---

## Error Handling Patterns

### Common OTP Errors

```typescript
import { verifyOtp } from "@/features/shared/auth/actions/oauth";

const result = await verifyOtp({ tokenHash, type: "email" });

if (result.error) {
    // Handle different error types
    if (result.error.message.includes("invalid") || result.error.message.includes("expired")) {
        // Token invalid or expired
        console.log("Token is invalid or expired");
        // Show re-send option
    } else if (result.error.message.includes("used")) {
        // Token already used
        console.log("This verification link was already used");
        // Redirect to login
    } else {
        // Other errors
        console.log("Verification failed:", result.error.message);
    }
}
```

---

## Integration with Auth Store

```typescript
import { verifyOtp } from "@/features/shared/auth/actions/oauth";
import { useAuthStore } from "@/features/shared/auth";

export async function completeOtpFlow(tokenHash: string) {
    // Verify OTP
    const result = await verifyOtp({
        tokenHash,
        type: "email",
    });

    if (result.error) {
        return { success: false, error: result.error.message };
    }

    // Sync store with new session
    const { updateAuthState } = useAuthStore.getState();
    const success = await updateAuthState({ session: result.session });

    return { success, user: result.user };
}
```

---

## Security Considerations

- **Token Validation**: Tokens should only be used once
- **Expiry Checking**: Tokens expire after a set time (typically 1 hour)
- **HTTPS Only**: Token hashes should only be transmitted over HTTPS
- **User Verification**: Always verify the authenticated user's identity after verification
- **Rate Limiting**: Implement rate limiting on OTP requests
- **No Token Logging**: Never log or expose token hashes in production

---

## OTP Types Reference

| Type        | Use Case           | Duration | Notes                              |
| ----------- | ------------------ | -------- | ---------------------------------- |
| `email`     | Email verification | 1 hour   | Standard email verification        |
| `magiclink` | Passwordless login | 1 hour   | Used for magic link authentication |
| `invite`    | User invitations   | 7 days   | Longer expiry for invitations      |
| `recovery`  | Account recovery   | 1 hour   | For password reset flows           |

---

## Complete Example: Email Verification Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp } from '@/features/shared/auth/actions/oauth';
import { useAuthStore } from '@/features/shared/auth';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const tokenHash = searchParams.get('token_hash');

      if (!tokenHash) {
        setStatus('error');
        setErrorMessage('No verification token found');
        return;
      }

      try {
        const result = await verifyOtp({
          tokenHash,
          type: 'email'
        });

        if (result.error) {
          setStatus('error');
          setErrorMessage(result.error.message);
          return;
        }

        // Update store with verified session
        const { updateAuthState } = useAuthStore.getState();
        const success = await updateAuthState({ session: result.session });

        if (success) {
          setStatus('success');
          // Redirect after showing success message
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage('Failed to establish session');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {status === 'verifying' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Verifying your email...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center text-green-600">
          <p className="text-xl font-semibold">✓ Email verified!</p>
          <p className="mt-2">Redirecting to dashboard...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">✗ Verification failed</p>
          <p className="mt-2">{errorMessage}</p>
          <a href="/sign-in" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to login
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## Logging

Operations are logged for debugging and security auditing:

```typescript
const log = logger.child({ module: "AuthOAuthActions" });

log.error({ err: error, operation: "verifyOtp" }, "Error verifying OTP");
log.info({ operation: "verifyOtp", type }, "OTP verified successfully");
```

---

## Dependencies

- **@supabase/supabase-js**: OAuth and OTP types and client
- **@/lib/supabase/client**: Client-side Supabase initialization
- **@/lib/logger**: Application logger

---

## See Also

- [User Actions](./user.md) - User profile and session management
- [Auth Utils](./utils.md) - Low-level authentication utilities
- [Auth Store](../store.md) - Client-side auth state management
- [Supabase OTP Docs](https://supabase.com/docs/guides/auth/auth-otp)
