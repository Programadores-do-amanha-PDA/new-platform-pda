# Logger Configuration

## Overview

The PDA Platform uses Pino for fast, structured logging across all API routes and server actions.

## Features

- **Multiple log levels**: trace, debug, info, warn, error, fatal
- **Structured JSON logging** in production
- **Pretty-printed console output** with colors in development (via pino-pretty)
- **High performance** with minimal overhead
- **Automatic serialization** of errors and objects

## Log Levels

- `trace`: Very detailed debugging information (function entry/exit)
- `debug`: Detailed information for debugging (validation, processing steps)
- `info`: General information about application flow (successful operations)
- `warn`: Warning messages for potential issues (rate limits, deprecated usage)
- `error`: Error conditions that need attention (failed operations)
- `fatal`: Critical errors that cause application failure (system crashes)

### When to Use Each Level

#### `trace` - Function Flow (Development Only)

Use sparingly for debugging complex flows. Filtered out in production.

```typescript
log.trace({ userId }, "Entering user validation function");
```

#### `debug` - Internal Operations (Development Only)

For detailed debugging information. Filtered out in production.

```typescript
log.debug({ userId }, "Checking user permissions");
log.debug({ query: sanitizedQuery }, "Executing database query");
```

#### `info` - Business Operations (Production)

For successful state changes and important business events.

```typescript
log.info({ userId: 123 }, "User login successful");
log.info({ orderId: 456, amount: 99.99 }, "Payment processed successfully");
log.info({ userId: 123, roleId: 2 }, "User role updated");
```

#### `warn` - Potential Issues (Production)

For recoverable issues that might need attention.

```typescript
log.warn({ userId: 123, attempts: 3 }, "Multiple failed login attempts");
log.warn({ requests: 95, limit: 100 }, "Rate limit approaching");
```

#### `error` - Failed Operations (Production)

For all errors that prevent normal operation.

```typescript
log.error({ err: error, userId: 123 }, "User authentication failed");
log.error({ err: error, operation: "payment" }, "Payment processing failed");
```

#### `fatal` - System Failures (Production)

For critical errors that crash the application.

```typescript
log.fatal({ err: error }, "Database connection lost");
log.fatal({ err: error }, "Critical service unavailable");
```

## Usage

### Import and instantiate the logger

```typescript
import { logger } from "@/lib/logger";

const log =  logger.child({ module: "folder.file" });
```

### Basic logging

```typescript
log.info({
    userId: "123",
    email: "user@example.com",
}, "User authenticated successfully");

log.error({ err: error, operation: "user-fetch" }, "Database connection failed");

log.warn({ requests: 95, limit: 100 }, "Rate limit approaching");

log.debug({ data: someData }, "Processing data");
```

### API Route logging

#### Using withRequestLogging (Recommended)

```typescript
import { withRequestLogging } from "@/lib/logger/logger.middleware";

export async function POST(request: NextRequest) {
  return withRequestLogging(request, async () => {
    const body = await request.json();
    
    // Your business logic here
    const result = await processUser(body);
    
    return NextResponse.json(result);
  }, { module: "users.create" });
}
```

#### Manual Request Logging

```typescript
import { createRequestLogger } from "@/lib/logger/logger.middleware";

export async function GET(request: NextRequest) {
  const log = createRequestLogger(request, "users.list");
  
  try {
    log.debug("Fetching users from database");
    
    const users = await getUsers();
    
    log.info({ count: users.length }, "Users fetched successfully");
    
    return NextResponse.json(users);
  } catch (error) {
    log.error({ err: error }, "Failed to fetch users");
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
```

#### Traditional API Route Logging

```typescript
export async function POST(request: NextRequest) {
    try {
        log.info({
            endpoint: "/api/users",
            method: "POST",
            userAgent: request.headers.get("user-agent"),
        }, "API request received");

        // ... your logic

        log.info("API request completed successfully");
        return NextResponse.json({ success: true });
    } catch (error) {
        log.error({ err: error, endpoint: "/api/users" }, "API request failed");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
```

### Server Actions logging

```typescript
import { logger } from "@/lib/logger";

export async function createUserAction(formData: FormData) {
  const log = logger.child({ module: "actions.users.create" });
  
  try {
    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };
    
    log.info({ email: userData.email }, "Creating new user");
    
    const user = await createUser(userData);
    
    if (user) {
      log.info({ userId: user.id }, "User created successfully");
      return { success: true, user };
    } else {
      log.error("User creation returned null");
      return { success: false, error: "Failed to create user" };
    }
  } catch (error) {
    log.error({ err: error }, "Failed to create user");
    return { success: false, error: "Failed to create user" };
  }
}
```

### Child loggers

Create child loggers with bound context:

```typescript
const requestLogger = logger.child({ requestId: "abc-123" });
requestLogger.info("Processing request"); // Automatically includes requestId
```

## Environment Configuration

- **Development**:
  - Log level: `debug`
  - Output: Pretty-printed console with colors (via pino-pretty)
  - Human-readable format with timestamps
  
- **Production**:
  - Log level: `warn`
  - Output: JSON format to stdout
  - Optimized for log aggregation services

## Best Practices

1. Always include relevant context as the first parameter (object)
2. Use appropriate log levels (prefer `info` for normal operations)
3. Don't log sensitive information (passwords, tokens, PII)
4. Use structured data for better searchability
5. For errors, use `{ err: error }` to get automatic serialization
6. Use child loggers to maintain context across related operations
7. Keep log messages concise and descriptive

### Logging Strategy by Operation Type

#### Read Operations (GET/SELECT)

- **Log only errors** - Success cases are expected and don't need logging
- Include relevant identifiers for debugging (userId, jobId, etc.)

```typescript
export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({ where: { id } });
        return user; // No success log needed
    } catch (error) {
        log.error({ err: error, userId: id, operation: "getUserById" }, "Failed to fetch user");
        return null;
    }
};
```

#### Write Operations (CREATE/UPDATE/DELETE)

- **Log both success and errors** - These operations change state and should be tracked
- Include operation context and affected resource identifiers

```typescript
export const createUser = async (userData: CreateUserData) => {
    try {
        const user = await db.user.create({ data: userData });
        log.info({ userId: user.id, email: userData.email }, "User created successfully");
        return { data: user };
    } catch (error) {
        log.error({ err: error, email: userData.email, operation: "createUser" }, "Failed to create user");
        return { error: "Failed to create user" };
    }
};

export const updateUser = async (id: string, userData: UpdateUserData) => {
    try {
        const user = await db.user.update({ where: { id }, data: userData });
        log.info({ userId: id }, "User updated successfully");
        return user;
    } catch (error) {
        log.error({ err: error, userId: id, operation: "updateUser" }, "Failed to update user");
        return null;
    }
};

export const deleteUser = async (id: string) => {
    try {
        await db.user.delete({ where: { id } });
        log.info({ userId: id }, "User deleted successfully");
        return true;
    } catch (error) {
        log.error({ err: error, userId: id, operation: "deleteUser" }, "Failed to delete user");
        return false;
    }
};
```

### Structured Context Guidelines

Always include relevant context for debugging and monitoring:

- **operation**: Function/method name for easy identification
- **Resource identifiers**: userId, jobId, applicationId, etc.
- **Request context**: endpoint, method, userAgent (for API routes)
- **Business context**: count, status, type, etc.

```typescript
// Good: Structured context
log.error({ 
    err: error, 
    userId: "123", 
    jobId: "456", 
    operation: "createJobApplication" 
}, "Failed to create job application");

// Bad: String concatenation
log.error(`Error creating job application for user ${userId}: ${error.message}`);
```

### Performance Considerations

- **Avoid excessive logging** in read operations - they're called frequently
- **Use appropriate log levels** - `debug` and `trace` are filtered out in production
- **Don't log large objects** - extract only relevant fields
- **Use child loggers** to avoid repeating context

```typescript
// Good: Extract relevant fields
log.info({ userId: user.id, email: user.email }, "User authenticated");

// Bad: Log entire object
log.info({ user }, "User authenticated"); // May contain sensitive data
```

## Common Anti-Patterns to Avoid

### ❌ Wrong Parameter Order

```typescript
// Wrong: Message first, context second
log.error("Failed to create user", { err: error, userId });

// Correct: Context first, message second
log.error({ err: error, userId }, "Failed to create user");
```

### ❌ String Concatenation

```typescript
// Wrong: Hard to parse and search
log.error(`User ${userId} failed to login: ${error.message}`);

// Correct: Structured data
log.error({ err: error, userId }, "User login failed");
```

### ❌ Logging Sensitive Data

```typescript
// Wrong: Exposes sensitive information
log.info({ password, creditCard }, "Processing payment");

// Correct: Log only safe identifiers
log.info({ userId, orderId }, "Processing payment");
```

### ❌ Excessive Success Logging in Read Operations

```typescript
// Wrong: Too verbose for frequent operations
export const getUsers = async () => {
    try {
        const users = await db.user.findMany();
        log.info({ count: users.length }, "Users fetched successfully"); // Unnecessary
        return users;
    } catch (error) {
        log.error({ err: error }, "Failed to fetch users");
        return [];
    }
};

// Correct: Only log errors for read operations
export const getUsers = async () => {
    try {
        const users = await db.user.findMany();
        return users; // No success log needed
    } catch (error) {
        log.error({ err: error, operation: "getUsers" }, "Failed to fetch users");
        return [];
    }
};
```

### ❌ Missing Operation Context

```typescript
// Wrong: Hard to identify where error occurred
log.error({ err: error }, "Database error");

// Correct: Include operation context
log.error({ err: error, operation: "createUser" }, "Database error");
```

## Pino Conventions

- First parameter should be an object with context data
- Second parameter is the log message string
- For errors, use `{ err: error }` key for automatic stack trace serialization
- Pino automatically adds timestamps and log levels

## Further Reading

- [Pino Documentation](https://getpino.io/#/)
- [Pino-pretty Documentation](https://github.com/pinojs/pino-pretty)
