"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/use-auth";
import { getAuthParamsFromUrl, useOtpHandler } from "./process-pkce-flow";

/**
 * Authentication Confirmation Hook
 *
 * Processes OAuth callback parameters from URL to authenticate users and handle password reset flows.
 * This hook serves as the entry point for authentication callbacks, extracting tokens and types
 * from URL parameters and delegating to specialized OTP verification handlers.
 *
 * ## Responsibilities
 * - Extracts authentication parameters from URL hash and query strings
 * - Handles OAuth errors and token expiration
 * - Delegates OTP verification processing to specialized functions
 * - Maintains URL cleanliness by removing sensitive parameters after processing
 *
 * ## Security Features
 * - Automatic URL parameter cleaning to prevent token leakage
 * - Comprehensive error handling with user feedback
 * - Support for both hash-based and query string parameters
 * - Time-delayed redirects on authentication failures
 *
 * ## Supported Authentication Flows
 * - **Signup**: New user registration
 * - **Magic Link**: Passwordless authentication
 * - **Password Reset**: Account recovery flows
 * - **Invite**: Team invitation acceptance
 *
 * @example
 * ```typescript
 * // Use in root layout or authentication pages
 * function AuthCallbackPage() {
 *   useAuthConfirmation();
 *   return <AuthLoadingSpinner />;
 * }
 * ```
 *
 * @see {@link useOtpHandler} for OTP verification implementation details
 * @see {@link getAuthParamsFromUrl} for URL parameter extraction
 */
export default function useAuthConfirmation(): void {
  const router = useRouter();
  const { updateAuthState } = useAuth();
  const { processOtpFlow, handleOAuthErrors } = useOtpHandler();

  useEffect(() => {
    // Early return during server-side rendering
    if (typeof window === "undefined") return;

    /**
     * Processes authentication parameters extracted from URL
     *
     * This function orchestrates the authentication flow by:
     * 1. Extracting parameters from URL
     * 2. Handling OAuth errors
     * 3. Processing OTP verification when token_hash is present
     *
     * @returns Promise that resolves when authentication processing completes
     */
    const processAuthParams = async (): Promise<void> => {
      const { tokenHash, type, error, errorDescription, expiresAt } =
        getAuthParamsFromUrl();

      // Exit early if no relevant authentication parameters found
      if (!tokenHash && !error) return;

      // Handle OAuth provider errors before attempting authentication
      const hasOAuthError = handleOAuthErrors(
        createSearchParamsWithAuthData(error, errorDescription, expiresAt)
      );

      if (hasOAuthError) return;

      // Process OTP verification flow when token_hash is present
      if (tokenHash) {
        await handleOtpAuthentication(tokenHash, type);
      }
    };

    /**
     * Creates URLSearchParams object with authentication error data
     *
     * @param error - OAuth error code from provider
     * @param errorDescription - Human-readable error description
     * @param expiresAt - Token expiration timestamp
     * @returns URLSearchParams containing authentication error data
     */
    const createSearchParamsWithAuthData = (
      error: string | null,
      errorDescription: string | null,
      expiresAt: string | null
    ): URLSearchParams => {
      const params = new URLSearchParams();

      if (error) params.set("error", error);
      if (errorDescription) params.set("error_description", errorDescription);
      if (expiresAt) params.set("expires_at", expiresAt);

      return params;
    };

    /**
     * Handles OTP authentication flow with error recovery
     *
     * @param tokenHash - Token hash from email/SMS verification
     * @param type - Type of authentication flow (signup, recovery, etc.)
     */
    const handleOtpAuthentication = async (
      tokenHash: string,
      type: string | null
    ): Promise<void> => {
      await processOtpFlow({
        tokenHash,
        type,
        router,
        updateAuthState,
        onError: handleAuthenticationError,
      });
    };

    /**
     * Handles authentication errors with user feedback and recovery
     *
     * @param error - Error encountered during authentication
     */
    const handleAuthenticationError = (error: Error): void => {
      console.error("Authentication flow failed:", error);

      // Redirect to login page after brief delay to allow user to read error message
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    };

    processAuthParams();
  }, [router, updateAuthState, processOtpFlow, handleOAuthErrors]);
}
