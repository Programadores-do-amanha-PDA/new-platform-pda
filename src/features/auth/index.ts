/**
 * Auth Domain Module
 *
 * Centralized authentication and authorization exports.
 * This module provides a unified API for:
 * - User authentication (sign-in, sign-out, OAuth)
 * - Password management (reset, recovery)
 * - Email confirmation flows
 * - Role-based access control (RBAC)
 * - Permission management
 */

// Auth shared utilities and hooks
export * from "./shared";

// Access control (roles, permissions)
export * from "./access-control";

// Feature-specific exports (page components)
export { default as SignInPage } from "./sign-in/page";
export { default as ResetPasswordPage } from "./reset-password/page";
export { default as EmailConfirmationPage } from "./email-confirmation/page";

// Re-export types for convenience
export type { JwtPayloadT } from "./shared/types/jwt";
export type { Role, UserRole, RolesLabels } from "./access-control/types";
