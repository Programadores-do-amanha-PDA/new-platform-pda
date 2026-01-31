import { AuthError, Session, type EmailOtpType } from "@supabase/supabase-js";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
import { OtpFlowParamsT, OtpFlowResultT } from "../types/otp-flow";
import { verifyOtp } from "../actions/oauth";
import { setSession } from "../actions/user";

const log = logger.child({ module: "ProcessOtpFlowHook" });

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
export async function processOtpFlow({
    tokenHash,
    type,
    router,
    updateAuthState,
    onSuccess,
    onError,
}: OtpFlowParamsT): Promise<OtpFlowResultT> {
    try {
        if (!tokenHash) {
            throw new Error("Token hash is missing");
        }

        const { session, error } = await verifyOtpTokenAndSaveSessionOnServer({ tokenHash, type });
        if (error) throw error;
        if (!session) {
            throw new Error("Failed to establish user session");
        }

        await updateAuthState({ session });
        cleanUrlParameters();

        // Determine redirect path and handle post-authentication
        const redirectPath = await handlePostAuthentication({ type, router });

        // Execute success callback if provided
        onSuccess?.(session, type);
        toast.success("Autenticação realizada com sucesso!");

        return {
            session,
            redirectPath,
            error: null,
        };
    } catch (error) {
        log.error({ err: error, operation: "processOtpFlow" }, "OTP flow error");
        const errorMessage =
            error instanceof Error || error instanceof AuthError
                ? error.message
                : "Falha na autenticação. Por favor, tente novamente.";

        // Execute error callback if provided
        onError?.(error instanceof Error || error instanceof AuthError ? error : new Error(errorMessage));
        toast.error(errorMessage);

        return {
            session: null,
            redirectPath: null,
            error: error instanceof Error || error instanceof AuthError ? error : new Error(errorMessage),
        };
    }
}

type VerifyOtpTokenAndSaveSessionOnServerParams = {
    tokenHash: string;
    type: string | null;
};

type VerifyOtpTokenAndSaveSessionOnServerResult =
    | {
          session: Session;
          error: null;
      }
    | {
          session: null;
          error: Error | AuthError;
      };

/**
 * Verifies OTP token and returns user session using Supabase
 *
 * @param tokenHash - Token hash from email/SMS verification
 * @param type - Type of authentication flow
 * @returns User session object
 * @throws Error if token verification fails
 */
const verifyOtpTokenAndSaveSessionOnServer = async ({
    tokenHash,
    type,
}: VerifyOtpTokenAndSaveSessionOnServerParams): Promise<VerifyOtpTokenAndSaveSessionOnServerResult> => {
    try {
        if (!tokenHash) throw new Error("Token hash is missing");

        const { user, session, error } = await verifyOtp({ tokenHash, type: type as EmailOtpType });
        if (error) throw new Error("Token verification failed");
        if (!session) throw new Error("No session returned from token verification");
        if (!user) throw new Error("No user returned from token verification");

        // Set session in server-side for middleware and server components
        const { session: serverSession, error: serverError } = await setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
        });
        if (serverError) throw new Error("Failed to establish server session");
        if (!serverSession) throw new Error("No server session returned");

        return { session: serverSession, error: null };
    } catch (error) {
        log.error({ err: error, operation: "verifyOtpTokenAndSaveSessionOnServer" }, "Error on token verification");
        return { session: null, error: error instanceof Error ? error : new Error("Unknown error during token verification") };
    }
};

type HandlePostAuthenticationParams = {
    type: string | null;
    router: AppRouterInstance;
};

/**
 * Handles post-authentication logic and determines redirect path
 *
 * @param type - Type of authentication flow
 * @param session - Established user session
 * @param router - Next.js router for navigation
 * @returns The path to redirect to
 */
async function handlePostAuthentication({ type, router }: HandlePostAuthenticationParams): Promise<string> {
    const redirectPath = getRedirectPath({ type });

    // Use setTimeout to ensure state updates complete before navigation
    setTimeout(() => {
        router.push(redirectPath);
    }, 100);

    return redirectPath;
}

type GetRedirectPathParams = {
    type: string | null;
};

/**
 * Determines appropriate redirect path based on authentication type and user state
 *
 * @param type - Type of authentication flow
 * @returns Path to redirect the user to
 */
const getRedirectPath = ({ type }: GetRedirectPathParams): string => {
    switch (type) {
        case "recovery":
            return "/reset-password";

        case "signup":
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
};

/**
 * Cleans sensitive authentication parameters from URL
 * Prevents token leakage through browser history, referrer, etc.
 */
const cleanUrlParameters = (): void => {
    if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
};

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

type GetAuthParamsFromUrlResult = {
    tokenHash: string | null;
    type: string | null;
    error: string | null;
    errorDescription: string | null;
    expiresAt: string | null;
};

/**
 * Utility to extract authentication parameters from URL
 *
 * @returns Object with tokenHash, type, and error information
 */
export function getAuthParamsFromUrl(): GetAuthParamsFromUrlResult {
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
