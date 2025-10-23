/**
 * Authentication error types for better error handling
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_NOT_CONFIRMED = "EMAIL_NOT_CONFIRMED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Structured error object for authentication operations
 */
export interface AuthErrorT {
  type: AuthErrorType;
  message: string;
  originalError?: unknown;
  field?: string; // For validation errors
}

/**
 * Creates a structured authentication error
 * @param type - Error type from AuthErrorType enum
 * @param message - User-friendly error message
 * @param originalError - Original error object for debugging
 * @param field - Form field associated with the error
 * @returns Structured AuthError object
 */
export const createAuthError = (
  type: AuthErrorType,
  message: string,
  originalError?: unknown,
  field?: string
): AuthErrorT => ({
  type,
  message,
  originalError,
  field,
});

/**
 * Parses and categorizes authentication errors
 * @param error - Raw error from authentication operation
 * @returns Structured AuthError object
 */
export const parseAuthError = (error: unknown): AuthErrorT => {
  if (typeof error === "string") {
    return createAuthError(AuthErrorType.UNKNOWN_ERROR, error, error);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("invalid login credentials")) {
      return createAuthError(
        AuthErrorType.INVALID_CREDENTIALS,
        "Email ou senha incorretos.",
        error
      );
    }

    if (message.includes("email not confirmed")) {
      return createAuthError(
        AuthErrorType.EMAIL_NOT_CONFIRMED,
        "Por favor, confirme seu email antes de fazer login.",
        error
      );
    }

    if (message.includes("too many requests")) {
      return createAuthError(
        AuthErrorType.TOO_MANY_REQUESTS,
        "Muitas tentativas. Tente novamente em alguns minutos.",
        error
      );
    }

    if (message.includes("user not found")) {
      return createAuthError(
        AuthErrorType.USER_NOT_FOUND,
        "Usuário não encontrado.",
        error
      );
    }

    if (message.includes("network") || message.includes("fetch")) {
      return createAuthError(
        AuthErrorType.NETWORK_ERROR,
        "Erro de conexão. Verifique sua internet e tente novamente.",
        error
      );
    }

    return createAuthError(
      AuthErrorType.UNKNOWN_ERROR,
      "Erro de autenticação. Tente novamente.",
      error
    );
  }

  return createAuthError(
    AuthErrorType.UNKNOWN_ERROR,
    "Erro desconhecido. Tente novamente.",
    error
  );
};

/**
 * Determines if an error is recoverable (user can retry)
 * @param error - AuthError object
 * @returns Boolean indicating if error is recoverable
 */
export const isRecoverableError = (error: AuthErrorT): boolean => {
  const recoverableTypes = [
    AuthErrorType.NETWORK_ERROR,
    AuthErrorType.TOO_MANY_REQUESTS,
    AuthErrorType.UNKNOWN_ERROR,
  ];

  return recoverableTypes.includes(error.type);
};

/**
 * Gets suggested action for an authentication error
 * @param error - AuthError object
 * @returns Suggested action string for user
 */
export const getErrorAction = (error: AuthErrorT): string => {
  switch (error.type) {
    case AuthErrorType.INVALID_CREDENTIALS:
      return "Verifique seu email e senha e tente novamente.";
    case AuthErrorType.EMAIL_NOT_CONFIRMED:
      return "Clique no link de confirmação enviado para seu email.";
    case AuthErrorType.TOO_MANY_REQUESTS:
      return "Aguarde alguns minutos antes de tentar novamente.";
    case AuthErrorType.USER_NOT_FOUND:
      return "Verifique se o email está correto ou crie uma nova conta.";
    case AuthErrorType.NETWORK_ERROR:
      return "Verifique sua conexão com a internet.";
    case AuthErrorType.VALIDATION_ERROR:
      return "Corrija os campos destacados e tente novamente.";
    default:
      return "Tente novamente ou entre em contato com o suporte.";
  }
};

/**
 * Logs authentication errors for debugging (development only)
 * @param error - AuthError object
 * @param context - Additional context for debugging
 */
export const logAuthError = (
  error: AuthErrorT,
  context?: Record<string, unknown>
): void => {
  if (process.env.NODE_ENV === "development") {
    console.group("🔐 Authentication Error");
    console.error("Type:", error.type);
    console.error("Message:", error.message);
    console.error("Field:", error.field);
    console.error("Original Error:", error.originalError);
    if (context) {
      console.error("Context:", context);
    }
    console.groupEnd();
  }
};