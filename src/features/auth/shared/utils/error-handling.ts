/**
 * Authentication error types for better error handling
 */
export enum AuthErrorType {
    INVALID_CREDENTIALS = "invalid_credentials",
    EMAIL_NOT_CONFIRMED = "email_not_confirmed",
    TOO_MANY_REQUESTS = "over_request_rate_limit",
    USER_NOT_FOUND = "user_not_found",
    NETWORK_ERROR = "NETWORK_ERROR",
    VALIDATION_ERROR = "validation_failed",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Complete mapping of error codes to Portuguese messages
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
    // Authentication and session errors
    invalid_credentials: "Credenciais inválidas. Verifique seu email e senha.",
    session_not_found: "Sessão inválida ou expirada. Por favor, faça login novamente.",
    session_expired: "Sua sessão expirou. Por favor, faça login novamente.",
    jwt_expired: "Sua sessão expirou. Por favor, faça login novamente.",
    token_refreshed: "Token inválido. Por favor, faça login novamente.",
    auth_timeout: "Tempo de autenticação expirado. Por favor, tente novamente.",

    // Password errors
    same_password: "A nova senha deve ser diferente da senha atual.",
    weak_password: "A senha não atende aos requisitos de segurança. Use uma senha mais forte.",
    password_pwned: "Esta senha foi comprometida em violações de dados. Escolha outra senha.",

    // Email errors
    email_exists: "Já existe uma conta com este email.",
    email_not_confirmed: "Seu email não foi confirmado. Verifique sua caixa de entrada.",
    invalid_email: "Formato de email inválido.",
    email_address_invalid: "Este domínio de email não é suportado. Use um email válido.",
    email_address_not_authorized: "Este email não está autorizado. Use um email autorizado ou configure um SMTP personalizado.",

    // Phone errors
    phone_exists: "Já existe uma conta com este número de telefone.",
    phone_not_confirmed: "Seu número de telefone não foi confirmado.",

    // Token and code errors
    otp_expired: "Código de verificação expirado. Solicite um novo código.",
    otp_disabled: "Login com código está desabilitado.",
    token_expired: "Token expirado. Solicite um novo.",
    bad_token: "Token inválido ou corrompido.",
    invalid_totp: "Código de autenticação inválido. Tente novamente.",

    // OAuth provider errors
    identity_already_exists: "Esta conta já está vinculada a outro usuário.",
    identity_not_found: "Conta vinculada não encontrada.",
    oauth_provider_not_supported: "Provedor OAuth não suportado ou desabilitado.",
    saml_idp_not_found: "Provedor SAML não encontrado.",
    saml_provider_disabled: "Login com SAML não está habilitado.",

    // MFA errors
    mfa_verification_failed: "Código de autenticação incorreto. Tente novamente.",
    mfa_factor_not_found: "Método de autenticação não encontrado.",
    mfa_challenge_expired: "Código MFA expirado. Solicite um novo.",
    insufficient_aal: "Autenticação adicional necessária. Complete a verificação MFA.",

    // Rate limit errors
    over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
    over_email_send_rate_limit: "Muitos emails enviados. Aguarde antes de solicitar outro.",
    over_sms_send_rate_limit: "Muitas mensagens SMS enviadas. Aguarde antes de tentar novamente.",

    // Signup/signin errors
    user_already_exists: "Usuário já existe. Faça login ou use outro email.",
    user_not_found: "Usuário não encontrado. Verifique suas credenciais.",
    signup_disabled: "Cadastros estão desabilitados no momento.",
    user_banned: "Sua conta está suspensa. Entre em contato com o suporte.",

    // Validation errors
    validation_failed: "Dados fornecidos são inválidos. Verifique os campos e tente novamente.",
    bad_request: "Requisição inválida. Verifique os dados enviados.",

    // Server errors
    unexpected_failure: "Erro inesperado no servidor. Tente novamente mais tarde.",
    service_timeout: "Serviço indisponível no momento. Tente novamente mais tarde.",
    server_error: "Erro interno do servidor. Tente novamente mais tarde.",

    // Captcha errors
    captcha_failed: "Verificação do captcha falhou. Tente novamente.",

    // Hook errors
    hook_timeout: "Serviço temporariamente indisponível. Tente novamente mais tarde.",
    hook_timeout_after_retry: "Serviço indisponível. Tente novamente mais tarde.",

    // General errors
    conflict: "Conflito de dados. Tente novamente.",
    bad_json: "Formato de dados inválido.",
    no_authorization: "Autorização necessária. Faça login primeiro.",
    not_admin: "Acesso restrito a administradores.",
};

/**
 * Gets error message by error code from the comprehensive error messages map
 * @param errorCode - The error code to look up
 * @returns User-friendly error message
 *
 * @example
 * const message = getAuthErrorMessage({ errorCode: 'invalid_credentials' });
 */
export const getAuthErrorMessage = ({ errorCode }: { errorCode: string }): { error: string } => {
    if (!errorCode || errorCode.trim() === "") {
        return { error: "Ocorreu um erro inesperado. Por favor, tente novamente." };
    }

    return {
        error: AUTH_ERROR_MESSAGES[errorCode] || "Ocorreu um erro inesperado. Por favor, tente novamente.",
    };
};

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
export const createAuthError = (type: AuthErrorType, message: string, originalError?: unknown, field?: string): AuthErrorT => ({
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
        const messageData = getAuthErrorMessage({ errorCode: error });
        return createAuthError(AuthErrorType.UNKNOWN_ERROR, messageData.error, error);
    }

    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        const errorCode = error.message;

        // Try to map by error code first
        const mappedMessage = getAuthErrorMessage({ errorCode });
        if (mappedMessage.error !== "Ocorreu um erro inesperado. Por favor, tente novamente.") {
            return createAuthError(AuthErrorType.UNKNOWN_ERROR, mappedMessage.error, error);
        }

        // Fallback to pattern detection
        if (message.includes("invalid login credentials")) {
            return createAuthError(AuthErrorType.INVALID_CREDENTIALS, AUTH_ERROR_MESSAGES.invalid_credentials, error);
        }

        if (message.includes("email not confirmed")) {
            return createAuthError(AuthErrorType.EMAIL_NOT_CONFIRMED, AUTH_ERROR_MESSAGES.email_not_confirmed, error);
        }

        if (message.includes("too many requests")) {
            return createAuthError(AuthErrorType.TOO_MANY_REQUESTS, AUTH_ERROR_MESSAGES.over_request_rate_limit, error);
        }

        if (message.includes("user not found")) {
            return createAuthError(AuthErrorType.USER_NOT_FOUND, AUTH_ERROR_MESSAGES.user_not_found, error);
        }

        if (message.includes("network") || message.includes("fetch")) {
            return createAuthError(
                AuthErrorType.NETWORK_ERROR,
                "Erro de conexão. Verifique sua internet e tente novamente.",
                error,
            );
        }

        return createAuthError(AuthErrorType.UNKNOWN_ERROR, "Erro de autenticação. Tente novamente.", error);
    }

    return createAuthError(AuthErrorType.UNKNOWN_ERROR, "Erro desconhecido. Tente novamente.", error);
};

/**
 * Determines if an error is recoverable (user can retry)
 * @param error - AuthError object
 * @returns Boolean indicating if error is recoverable
 */
export const isRecoverableError = (error: AuthErrorT): boolean => {
    const recoverableTypes = [AuthErrorType.NETWORK_ERROR, AuthErrorType.TOO_MANY_REQUESTS, AuthErrorType.UNKNOWN_ERROR];

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
 * Serializes an error object into a plain object for safe logging.
 * Prevents serialization errors when crossing Server/Client boundaries.
 *
 * @param error - The error to serialize
 * @returns A plain object with error details
 */
export const serializeError = (error: unknown) => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    if (typeof error === "string") {
        return { message: error };
    }

    return { message: "unknown error" };
};
