export type MaskEmailProps = {
    email: string;
};

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
    module?: string;
    requestId?: string;
    userId?: string;
    action?: string;
    [key: string]: unknown;
}

export interface RequestLogOptions {
    logSuccess?: boolean;
    module?: string;
    includeBody?: boolean;
    includeHeaders?: boolean;
}

export interface ErrorLogContext extends LogContext {
    errorCode?: string;
    errorType?: string;
    stack?: string;
}
