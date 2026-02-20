# Auth Email Actions

Utilities for sending authentication-related emails (server-side). These actions use the Supabase client and admin client to request password resets and resend signup confirmations.

**Sources:**

- Main actions: `src/features/shared/auth/actions/emails.ts`

---

## Architecture

The email sending system provides server action functions for common authentication email operations:

- **Password reset requests** — Single user password reset via Supabase client
- **Bulk password reset** — Multiple users password reset via Supabase admin client
- **Bulk signup confirmation resend** — Multiple users email verification via Supabase admin client

All functions handle validation, error logging, and rate limiting internally.

---

## requestPasswordResetByEmail

**Purpose:** Requests a password reset email for a user.

**Parameters:**

- `params.email: string` — The email address of the user requesting password reset.

**Returns:**

- `Promise<boolean>` — A promise that resolves to `true` if the password reset email was sent successfully, `false` otherwise.

**Notes:**

- Requires `PLATFORM_BASE_URL` environment variable to be set.
- Does not throw errors directly; errors are logged internally and the function returns `false` on failure.
- Email validation is performed using `REGEX_FOR_EMAIL_VALIDATION`.
- Uses the Supabase client (non-admin).

**Example:**

```typescript
const success = await requestPasswordResetByEmail({ email: 'user@example.com' });
if (success) {
  console.log('Password reset email sent');
}
```

---

## sendPasswordResetToMultipleUsers

**Purpose:** Send password reset emails to multiple users.

**Parameters:**

- `params.emails: string[]` — Array of email addresses to send password reset emails to.

**Returns:**

- `Promise<SendEmailToMultipleUsersResult>` — A discriminated union resolving to:
  - On success: `{ results: { successful: string[], failed: string[], total: number }, error: null }`
  - On error: `{ results: null, error: string }`

**Notes:**

- Uses the Supabase admin client.
- Requires `PLATFORM_BASE_URL` environment variable to be set.
- Does not throw errors directly; errors are caught and logged.
- Email validation is performed using `REGEX_FOR_EMAIL_VALIDATION`.
- Individual email failures are tracked in the `failed` array, not thrown.
- Rate limiting: 100ms delay is added between requests when processing multiple emails to prevent rate limiting.

**Example:**

```typescript
const {error, results} = await sendPasswordResetToMultipleUsers({
  emails: ['user1@example.com', 'user2@example.com']
});

if (error) {
  console.error(`Failed: ${error}`);
} else {
  console.log(`Sent to: ${results.successful.length}, Failed: ${results.failed.length}`);
}
```

---

## resendEmailSignupConfirmationToMultipleUsers

**Purpose:** Resend email signup confirmation (email verification) to multiple users.

**Parameters:**

- `params.emails: string[]` — Array of email addresses to send signup confirmation emails to.

**Returns:**

- `Promise<SendEmailToMultipleUsersResult>` — A discriminated union resolving to:
  - On success: `{ results: { successful: string[], failed: string[], total: number }, error: null }`
  - On error: `{ results: null, error: string }`

**Notes:**

- Uses the Supabase admin client.
- Requires `PLATFORM_BASE_URL` environment variable to be set for the email redirect URL.
- Does not throw errors directly; errors are caught and logged.
- Email validation is performed using `REGEX_FOR_EMAIL_VALIDATION`.
- Individual email failures are tracked in the `failed` array, not thrown.
- Rate limiting: 100ms delay is added between requests when processing multiple emails to prevent rate limiting.
- Uses Supabase's `resend()` method with type `signup`.

**Example:**

```typescript
const {error, results} = await resendEmailSignupConfirmationToMultipleUsers({
  emails: ['user1@example.com', 'user2@example.com']
});

if (error) {
  console.error(`Failed: ${error}`);
} else {
  console.log(`Resent to: ${results.successful.length}, Failed: ${results.failed.length}`);
}
```
