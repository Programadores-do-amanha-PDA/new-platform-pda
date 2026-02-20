/**
 * Auth Shared Module
 *
 * Core authentication utilities, hooks, and stores shared across auth features.
 */

// Store
export { useAuthStore } from "./store";

// Provider
export { default as AuthStoreProvider } from "./provider";

// Hooks
export { default as useAuth } from "./hooks/use-auth";
export { default as useAuthProcessUrlParams } from "./hooks/use-auth-confirmation";
export { useOtpHandler, getAuthParamsFromUrl } from "./hooks/process-pkce-flow";

// Utils
export { getAuthErrorMessage } from "./utils/error-handling";
