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

- `trace`: Very detailed debugging information
- `debug`: Detailed information for debugging
- `info`: General information about application flow
- `warn`: Warning messages for potential issues
- `error`: Error conditions that need attention
- `fatal`: Critical errors that cause application failure

## Usage

### Import and instantiate the logger

```typescript
import { logger } from "@/lib/logger";

const log =  logger.child({ name: "folder.file" });
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

## Pino Conventions

- First parameter should be an object with context data
- Second parameter is the log message string
- For errors, use `{ err: error }` key for automatic stack trace serialization
- Pino automatically adds timestamps and log levels

## Further Reading

- [Pino Documentation](https://getpino.io/#/)
- [Pino-pretty Documentation](https://github.com/pinojs/pino-pretty)
