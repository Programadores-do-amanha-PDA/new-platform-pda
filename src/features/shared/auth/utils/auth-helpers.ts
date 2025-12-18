// Local imports
import { REGEX_FOR_EMAIL_VALIDATION } from "@/utils/regex/user-regex-validations";
import { LoginResponseT } from "../types";

/**
 * Handles login response and determines next action
 * @param response - Login response from server
 * @param email - User email for redirect purposes
 * @returns Object with action type and redirect URL if needed
 */
export const handleLoginResponse = (
  response: LoginResponseT,
  email: string
): {
  success: boolean;
  redirectUrl?: string;
  errorMessage?: string;
} => {
  // Email confirmation required
  if (response.error && response.confirmation) {
    return {
      success: false,
      redirectUrl: `/resend-confirmation?email=${encodeURIComponent(email)}`,
      errorMessage: "Confirme seu email para continuar.",
    };
  }

  // Authentication error (invalid credentials)
  if (response.error && response.confirmation === false) {
    return {
      success: false,
      errorMessage: response.message || "Email ou senha incorretos.",
    };
  }

  // Login successful
  if (!response.error && response.data?.session) {
    return {
      success: true,
      redirectUrl: "/dashboard",
    };
  }

  // Fallback for unknown errors
  return {
    success: false,
    errorMessage: response.message || "Erro desconhecido",
  };
};

/**
 * Validates email format using regex
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  return REGEX_FOR_EMAIL_VALIDATION.test(email);
};

/**
 * Validates password strength
 * @param password - Password string to validate
 * @returns Object with validation result and requirements
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
} => {
  const requirements = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValid = Object.values(requirements).every(Boolean);

  return { isValid, requirements };
};

/**
 * Generates a secure password reset URL
 * @param token - Reset token from server
 * @param baseUrl - Application base URL
 * @returns Complete reset URL
 */
export const generateResetPasswordUrl = (
  token: string,
  baseUrl: string = window.location.origin
): string => {
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
};

/**
 * Extracts token from URL parameters
 * @param url - Current URL or search params
 * @returns Token string or null if not found
 */
export const extractTokenFromUrl = (url?: string): string | null => {
  const searchParams = new URLSearchParams(
    url || window.location.search
  );
  return searchParams.get("token");
};

/**
 * Formats authentication error messages for user display
 * @param error - Error object or string
 * @returns User-friendly error message
 */
export const formatAuthError = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    // Map common Supabase auth errors to user-friendly messages
    switch (error.message) {
      case "Invalid login credentials":
        return "Email ou senha incorretos.";
      case "Email not confirmed":
        return "Por favor, confirme seu email antes de fazer login.";
      case "Too many requests":
        return "Muitas tentativas. Tente novamente em alguns minutos.";
      case "User not found":
        return "Usuário não encontrado.";
      default:
        return "Erro de autenticação. Tente novamente.";
    }
  }

  return "Erro desconhecido. Tente novamente.";
};