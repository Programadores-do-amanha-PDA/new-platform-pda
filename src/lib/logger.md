# Logger Configuration

## Overview

The PDA Platform uses Winston for structured logging across all API routes and server actions.

## Features

- **Multiple log levels**: debug, info, warn, error, http
- **Structured JSON logging** for production
- **Console output** for development with colors
- **File rotation** with size limits (5MB per file, 5 files max)
- **Error stack traces** automatically captured
- **Request context** logging with user information

## Log Levels

- `debug`: Detailed information for debugging
- `info`: General information about application flow
- `warn`: Warning messages for potential issues
- `error`: Error conditions that need attention
- `http`: HTTP request/response logging

## Usage

### Import helper functions

```typescript
import { logInfo, logError, logWarn, logDebug, logHttp } from "@/lib/logger";
```

### Basic logging

```typescript
logInfo("User authenticated successfully", {
  userId: "123",
  email: "user@example.com",
});
logError("Database connection failed", error, { operation: "user-fetch" });
logWarn("Rate limit approaching", { requests: 95, limit: 100 });
```

### API Route logging

```typescript
export async function POST(request: NextRequest) {
  try {
    logInfo("API request received", {
      endpoint: "/api/users",
      method: "POST",
      userAgent: request.headers.get("user-agent"),
    });

    // ... your logic

    logInfo("API request completed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("API request failed", error, { endpoint: "/api/users" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Log Files

- `logs/app.log` - All application logs
- `logs/error.log` - Error logs only

## Environment Configuration

- **Development**: Logs to console with colors + files
- **Production**: Logs to files only (JSON format)
- **Log level**: `debug` in development, `info` in production

## Best Practices

1. Always include relevant context in log metadata
2. Use appropriate log levels
3. Don't log sensitive information (passwords, tokens)
4. Include user context when available
5. Log both success and failure cases
6. Use structured data for better searchability
