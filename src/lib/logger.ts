import winston from "winston";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
});

const isProduction = process.env.NODE_ENV === "production";

// Create logger instance
const logger = winston.createLogger({
    level: isProduction ? "info" : "debug",
    format: combine(
        errors({ stack: true }), // Capture stack traces
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        json(),
    ),
    defaultMeta: { service: "pda-platform" },
    transports: isProduction
        ? [
              new winston.transports.Console({
                  format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), consoleFormat),
              }),
              // File transport for all logs
              new winston.transports.File({
                  filename: "logs/app.log",
                  maxsize: 5242880, // 5MB
                  maxFiles: 5,
              }),
              // Separate file for errors
              new winston.transports.File({
                  filename: "logs/error.log",
                  level: "error",
                  maxsize: 5242880, // 5MB
                  maxFiles: 5,
              }),
          ]
        : // TODO Add a more robust solution for integration with a third-party registration service
          [
              new winston.transports.Console({
                  stderrLevels: ["error"],
              }),
          ],
});

// Helper functions for different log levels
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, meta);
};

export const logError = (message: string, error?: Error | unknown, meta?: Record<string, unknown>) => {
    logger.error(message, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        ...meta,
    });
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
    logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>) => {
    logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: Record<string, unknown>) => {
    logger.http(message, meta);
};

export { logger };
