"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { setSession } from "@/app/actions/(auth)";
import useAuth from "@/hooks/use-auth";

/**
 * Hook to handle authentication confirmation and password reset flows
 *
 * This hook processes URL parameters (both in hash and query strings) to handle:
 * - Authentication callbacks (signup, magiclink, password reset)
 * - Token expiration checks
 * - OTP (One-Time Password) validation
 * - Password reset redirection
 *
 * After processing parameters, it cleans the URL by removing authentication tokens and codes
 *
 * Key Parameters Handled:
 * - access_token: Supabase authentication token
 * - refresh_token: Supabase refresh token
 * - code: Password reset code (for recovery flow)
 * - type: Authentication flow type (signup, recovery, etc)
 * - expires_at: Token expiration timestamp
 * - error_code: Error code from authentication provider
 *
 * Authentication Flows:
 * 1. Password Reset (Recovery):
 *    - Stores reset code in localStorage
 *    - Redirects to /reset-password page
 * 2. Signup:
 *    - Sets user session
 *    - Updates auth state
 *    - Redirects to /dashboard
 * 3. Other flows (Magiclink, etc):
 *    - Sets user session without redirection
 *
 * Error Handling:
 * - token_expired: Notifies about expired tokens
 * - otp_expired: Notifies about expired verification codes
 */
export default function useAuthConfirmation() {
  const router = useRouter();
  const { updateAuthState, handleExchangeAuthCode } = useAuth();
  const pathname = usePathname();

  /**
   * Handle password reset flow
   * @param {string} code - The password reset code from URL
   */
  const handleResetPassword = useCallback(
    async (code: string) => {
      try {
        const session = await handleExchangeAuthCode(code);

        if (!session) {
          toast.error("Código de recuperação inválido ou expirado.");
          return;
        }
        updateAuthState(session);
        router.push("/reset-password");
      } catch (error) {
        console.error("Erro ao trocar código de autenticação:", error);
        toast.error(
          "Erro ao processar código de recuperação. Tente novamente."
        );
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    // Skip execution in SSR
    if (typeof window === "undefined") return;

    /**
     * Main authentication processing function
     */
    const processAuthParams = async () => {
      // Extract authentication parameters from URL
      const hash = window.location.hash.substring(1);
      const search = window.location.search.substring(1);
      const paramsString = hash || search;
      if (!paramsString) return;

      const params = new URLSearchParams(paramsString);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const verificationCode = params.get("code");
      const authType = params.get("type");
      const expiresAt = params.get("expires_at");
      const errorCode = params.get("error_code");

      // Clean authentication parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Handle expired tokens
      if (expiresAt && new Date(parseInt(expiresAt) * 1000) < new Date()) {
        toast.error("Token expirado! Tente realizar o login novamente.");
        return;
      }

      // Handle expired OTP codes
      if (errorCode === "otp_expired") {
        toast.error(
          "Código de verificação expirado. Por favor, solicite um novo."
        );
        return;
      }

      // Handle password reset flow (with or without type=recovery)
      if (verificationCode && (authType === "recovery" || !authType)) {
        handleResetPassword(verificationCode);
      }

      /**
       * Helper function to authenticate user
       * @param {string} accessToken - Supabase access token
       * @param {string} refreshToken - Supabase refresh token
       * @param {Function} [onSuccess] - Optional callback on successful authentication
       */
      const handleAuthentication = async (
        accessToken: string,
        refreshToken: string,
        onSuccess?: () => void
      ) => {
        try {
          const session = await setSession(accessToken, refreshToken);

          // Validate session
          if (!session) {
            toast.error("Token inválido! Tente realizar o login novamente.");
            return;
          }

          // Update global auth state
          updateAuthState(session);

          // Execute success callback if provided
          onSuccess?.();
        } catch (error) {
          console.error("Erro ao confirmar autenticação:", error);
          toast.error("Erro ao processar autenticação. Tente novamente.");
        }
      };

      // Handle signup authentication (redirects to dashboard)
      if (accessToken && refreshToken && authType === "signup" && expiresAt) {
        await handleAuthentication(accessToken, refreshToken, () => {
          toast.success("Login feito com sucesso!");
          router.push("/dashboard");
        });
        return;
      }

      // Handle other authentication types like magiclink (no redirect)
      if (accessToken && refreshToken && authType && authType !== "signup") {
        await handleAuthentication(accessToken, refreshToken);
      }
    };

    processAuthParams();
  }, [router, updateAuthState, handleResetPassword]);
}
