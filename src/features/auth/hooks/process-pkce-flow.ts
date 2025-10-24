// GLobal imports
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Session, type EmailOtpType } from "@supabase/supabase-js";
import { toast } from "sonner";

// Actions
import { setSession, verifyOtp } from "@/app/actions";

// Libs
import { OtpFlowParamsT, OtpFlowResultT } from "../types";

/**
 * Handles OTP (One-Time Password) authentication flow
 *
 * This function verifies OTP tokens from email/SMS and establishes user sessions.
 * It provides a centralized way to handle email verification and magic link flows.
 *
 * @example
 * ```typescript
 * // In your auth callback component
 * const { processOtpFlow } = useOtpHandler();
 *
 * useEffect(() => {
 *   const tokenHash = searchParams.get('token_hash');
 *   const type = searchParams.get('type');
 *
 *   if (tokenHash) {
 *     processOtpFlow({ tokenHash, type, router, updateAuthState });
 *   }
 * }, []);
 * ```
 */

/**
 * Processes OTP authentication flow by verifying token hash
 *
 * Security Features:
 * - One-time use of token hashes
 * - Secure token verification via Supabase
 * - Automatic cleanup of sensitive parameters from URL
 * - Comprehensive error handling
 *
 * Supported Flow Types:
 * - signup: User registration flow
 * - recovery: Password reset flow
 * - magiclink: Magic link authentication
 * - invite: User invitation flow
 * - email_change: Email change confirmation
 *
 * @param params - OTP flow parameters
 * @returns Promise with the flow result
 */
export async function processOtpFlow(
  params: OtpFlowParamsT
): Promise<OtpFlowResultT> {
  const { tokenHash, type, router, updateAuthState, onSuccess, onError } =
    params;

  try {
    // Validate required token_hash parameter
    if (!tokenHash) {
      throw new Error("Token hash is missing");
    }

    // Verify OTP token and get session
    const session = await verifyOtpToken(tokenHash, type);

    // Update application authentication state
    updateAuthState(session);

    // Clean URL parameters for security
    cleanUrlParameters();

    // Determine redirect path and handle post-authentication
    const redirectPath = await handlePostAuthentication(type, session, router);

    // Execute success callback if provided
    onSuccess?.(session, type);

    // Show success feedback
    toast.success("Authentication successful!");

    return {
      success: true,
      session,
      redirectPath,
    };
  } catch (error) {
    console.error("OTP flow error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Authentication failed. Please try again.";

    // Execute error callback if provided
    onError?.(error instanceof Error ? error : new Error(errorMessage));

    // Show error feedback
    toast.error(errorMessage);

    return {
      success: false,
      error: error instanceof Error ? error : new Error(errorMessage),
    };
  }
}

/**
 * Verifies OTP token and returns user session using Supabase
 *
 * @param tokenHash - Token hash from email/SMS verification
 * @param type - Type of authentication flow
 * @returns User session object
 * @throws Error if token verification fails
 */
async function verifyOtpToken(tokenHash: string, type: string | null) {
  try {
    // Verify OTP token using Supabase's built-in method
    const result = await verifyOtp(
      tokenHash,
      type as EmailOtpType
    );

    if (result.error) {
      const errorMessage =
        result.error instanceof Error ? result.error.message : String(result.error);
      throw new Error(`Token verification failed: ${errorMessage}`);
    }

    if (!result.session || !result.user) {
      throw new Error("No session or user returned from token verification");
    }

    // Set session in server-side for middleware and server components
    const serverSessionResult = await setSession(
      result.session.access_token,
      result.session.refresh_token
    );

    if (serverSessionResult.error || !serverSessionResult.session) {
      throw new Error("Failed to establish server session");
    }

    return serverSessionResult.session;
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
}

/**
 * Handles post-authentication logic and determines redirect path
 *
 * @param type - Type of authentication flow
 * @param session - Established user session
 * @param router - Next.js router for navigation
 * @returns The path to redirect to
 */
async function handlePostAuthentication(
  type: string | null,
  session: Session,
  router: AppRouterInstance
): Promise<string> {
  const redirectPath = getRedirectPath(type, session);

  // Use setTimeout to ensure state updates complete before navigation
  setTimeout(() => {
    router.push(redirectPath);
  }, 100);

  return redirectPath;
}

/**
 * Determines appropriate redirect path based on authentication type and user state
 *
 * @param type - Type of authentication flow
 * @param session - User session object
 * @returns Path to redirect the user to
 */
function getRedirectPath(type: string | null, session: Session): string {
  switch (type) {
    case "recovery":
      return "/reset-password";

    case "signup":
      // Check if user needs to complete profile
      if (!session.user?.user_metadata?.profile_completed) {
        return "/onboarding";
      }
      return "/dashboard";

    case "invite":
      return "/accept-invite";

    case "magiclink":
      return "/dashboard";

    case "email_change":
      return "/dashboard?message=email_updated";

    default:
      // Default redirect based on user role or previous page
      const previousPath = sessionStorage.getItem("previous_path");
      if (previousPath && previousPath.startsWith("/")) {
        sessionStorage.removeItem("previous_path");
        return previousPath;
      }
      return "/dashboard";
  }
}

/**
 * Cleans sensitive authentication parameters from URL
 * Prevents token leakage through browser history, referrer, etc.
 */
function cleanUrlParameters(): void {
  if (typeof window !== "undefined") {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

/**
 * Hook for using OTP flow in React components
 *
 * @example
 * ```typescript
 * const { processOtpFlow, isProcessing } = useOtpHandler();
 *
 * const handleAuthCallback = async (tokenHash: string) => {
 *   const result = await processOtpFlow({
 *     tokenHash,
 *     type: 'signup',
 *     router,
 *     updateAuthState
 *   });
 *
 *   if (result.success) {
 *   }
 * };
 * ```
 */
export function useOtpHandler() {
  /**
   * Processes OAuth errors from URL parameters
   *
   * @param searchParams - URL search parameters
   * @returns True if error was handled, false otherwise
   */
  const handleOAuthErrors = (searchParams: URLSearchParams): boolean => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const expiresAt = searchParams.get("expires_at");

    // Handle expired tokens
    if (expiresAt && isTokenExpired(expiresAt)) {
      toast.error("Token expirado! Tente realizar o login novamente.");
      return true;
    }

    // Handle OAuth errors from provider
    if (error) {
      const message = errorDescription || `Erro de autenticação: ${error}`;
      toast.error(message);
      return true;
    }

    return false;
  };

  /**
   * Checks if token has expired
   *
   * @param expiresAt - Unix timestamp string
   * @returns True if token is expired
   */
  const isTokenExpired = (expiresAt: string): boolean => {
    const expirationDate = new Date(parseInt(expiresAt) * 1000);
    return expirationDate < new Date();
  };

  return {
    processOtpFlow,
    handleOAuthErrors,
    isTokenExpired,
  };
}

/**
 * Utility to extract authentication parameters from URL
 *
 * @returns Object with tokenHash, type, and error information
 */
export function getAuthParamsFromUrl(): {
  tokenHash: string | null;
  type: string | null;
  error: string | null;
  errorDescription: string | null;
  expiresAt: string | null;
} {
  if (typeof window === "undefined") {
    return {
      tokenHash: null,
      type: null,
      error: null,
      errorDescription: null,
      expiresAt: null,
    };
  }

  // Check both hash and query string parameters
  const hash = window.location.hash.substring(1);
  const search = window.location.search.substring(1);
  const paramsString = hash || search;

  if (!paramsString) {
    return {
      tokenHash: null,
      type: null,
      error: null,
      errorDescription: null,
      expiresAt: null,
    };
  }

  const params = new URLSearchParams(paramsString);

  return {
    tokenHash: params.get("token_hash"),
    type: params.get("type"),
    error: params.get("error"),
    errorDescription: params.get("error_description"),
    expiresAt: params.get("expires_at"),
  };
}
