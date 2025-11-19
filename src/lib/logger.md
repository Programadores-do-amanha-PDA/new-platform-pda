# Logger Configuration

## Overview

The PDA Platform uses Winston for structured logging across all API routes and server actions.

## Features

- **Multiple log levels**: debug, info, warn, error, http
- **Structured JSON logging** for file outputs
- **Console output** with timestamps and colors (development)
- **File rotation** with size limits (5MB per file, 5 files max) in development
- **Error stack traces** automatically captured
- **Service metadata** included automatically

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
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
```

## Log Files (Development Only)

- `logs/app.log` - All application logs in JSON format
- `logs/error.log` - Error logs only in JSON format

## Environment Configuration

- **Development**:
  - Log level: `debug`
  - Output: Console (colored with timestamps) + File transport (JSON)
  - Includes timestamps, service metadata, and stack traces
  - File rotation enabled (5MB per file, 5 files max)
- **Production**:
  - Log level: `info`
  - Output: Console only (JSON format)
  - Errors printed to stderr
  - No file transport (ready for third-party logging service integration)

## Best Practices

1. Always include relevant context in log metadata
2. Use appropriate log levels (prefer `info` for normal operations)
3. Don't log sensitive information (passwords, tokens)
4. Use structured data for better searchability
5. Include complete error objects in `logError` calls
6. Utilize the `debug` level for verbose development logging

## Default Metadata

All logs include automatic service metadata:

```json
{ "service": "pda-platform" }
```
