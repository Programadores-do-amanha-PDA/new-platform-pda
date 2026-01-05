import { AuthUserWithProfile } from "@/features/dashboard/shared/profile";
import { MaskEmailProps } from "./types";
import pino, { Logger, LoggerOptions } from "pino";

export const generateLoggerConfigByEnvironment = (): Logger => {
    const isDevelopment = process.env.NODE_ENV === "development";
    const isProduction = process.env.NODE_ENV === "production";

    const generalConfig: LoggerOptions = {
        serializers: { ...SECURITY_SERIALIZER },
        redact: {
            paths: [...SECURITY_REDACT],
            remove: true,
        },
    };

    if (isProduction) {
        generalConfig.level = "info";
    } else if (isDevelopment) {
        generalConfig.level = "debug";
        generalConfig.transport = {
            target: "pino-pretty",
            options: {
                colorize: true,
            },
        };
    }

    return pino(generalConfig);
};


export const maskEmail = ({ email }: MaskEmailProps) => {
    const [local, domain] = email.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
};

export const SECURITY_SERIALIZER = {
    user: (user: AuthUserWithProfile) => ({
        id: user.id,
        username: user?.profile?.full_name,
        email: user.email ? maskEmail({ email: user.email }) : undefined,
        role: user.role,
        lastLogin: user.last_sign_in_at,
    }),

    request: (req: Request) => {
        const safeHeaders = new Headers();

        // Copy non-sensitive headers
        req.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (!["authorization", "x-api-key", "cookie"].includes(lowerKey)) {
                safeHeaders.set(key, value);
            }
        });

        return {
            method: req.method,
            url: req.url,
            headers: Object.fromEntries(safeHeaders.entries()),
        };
    },

    error: (err: Error) => {
        const safeError = { ...err };
        if (safeError.message) {
            safeError.message = safeError.message
                .replace(/password=\w+/gi, "password=***")
                .replace(/token=[\w-]+/gi, "token=***");
        }
        return safeError;
    },
};

export const SECURITY_REDACT: string[] = [
    "password",
    "token",
    "apiKey",
    "creditCard.number",
    "ssn",
    "*.password",
    "*.token",
    "req.headers.authorization",
    "req.headers.cookie",
];
