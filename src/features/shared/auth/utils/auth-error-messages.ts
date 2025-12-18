import { AuthErrorCodeT } from "../types/auth-error-messages";

export const getAuthErrorMessage = (errorCode: AuthErrorCodeT): { error: string } => {
    // Mapeamento de códigos de erro para mensagens em português
    const errorMessages: Record<string, string> = {
        // Erros de autenticação e sessão
        invalid_credentials: "Credenciais inválidas. Verifique seu email e senha.",
        session_not_found: "Sessão inválida ou expirada. Por favor, faça login novamente.",
        session_expired: "Sua sessão expirou. Por favor, faça login novamente.",
        jwt_expired: "Sua sessão expirou. Por favor, faça login novamente.",
        token_refreshed: "Token inválido. Por favor, faça login novamente.",
        auth_timeout: "Tempo de autenticação expirado. Por favor, tente novamente.",

        // Erros de senha
        same_password: "A nova senha deve ser diferente da senha atual.",
        weak_password: "A senha não atende aos requisitos de segurança. Use uma senha mais forte.",
        password_pwned: "Esta senha foi comprometida em violações de dados. Escolha outra senha.",

        // Erros de email
        email_exists: "Já existe uma conta com este email.",
        email_not_confirmed: "Seu email não foi confirmado. Verifique sua caixa de entrada.",
        invalid_email: "Formato de email inválido.",
        email_address_invalid: "Este domínio de email não é suportado. Use um email válido.",
        email_address_not_authorized:
            "Este email não está autorizado. Use um email autorizado ou configure um SMTP personalizado.",

        // Erros de telefone
        phone_exists: "Já existe uma conta com este número de telefone.",
        phone_not_confirmed: "Seu número de telefone não foi confirmado.",

        // Erros de token e código
        otp_expired: "Código de verificação expirado. Solicite um novo código.",
        otp_disabled: "Login com código está desabilitado.",
        token_expired: "Token expirado. Solicite um novo.",
        bad_token: "Token inválido ou corrompido.",
        invalid_totp: "Código de autenticação inválido. Tente novamente.",

        // Erros de provider OAuth
        identity_already_exists: "Esta conta já está vinculada a outro usuário.",
        identity_not_found: "Conta vinculada não encontrada.",
        oauth_provider_not_supported: "Provedor OAuth não suportado ou desabilitado.",
        saml_idp_not_found: "Provedor SAML não encontrado.",
        saml_provider_disabled: "Login com SAML não está habilitado.",

        // Erros de MFA
        mfa_verification_failed: "Código de autenticação incorreto. Tente novamente.",
        mfa_factor_not_found: "Método de autenticação não encontrado.",
        mfa_challenge_expired: "Código MFA expirado. Solicite um novo.",
        insufficient_aal: "Autenticação adicional necessária. Complete a verificação MFA.",

        // Erros de rate limit
        over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
        over_email_send_rate_limit: "Muitos emails enviados. Aguarde antes de solicitar outro.",
        over_sms_send_rate_limit: "Muitas mensagens SMS enviadas. Aguarde antes de tentar novamente.",

        // Erros de signup/login
        user_already_exists: "Usuário já existe. Faça login ou use outro email.",
        user_not_found: "Usuário não encontrado. Verifique suas credenciais.",
        signup_disabled: "Cadastros estão desabilitados no momento.",
        user_banned: "Sua conta está suspensa. Entre em contato com o suporte.",

        // Erros de validação
        validation_failed: "Dados fornecidos são inválidos. Verifique os campos e tente novamente.",
        bad_request: "Requisição inválida. Verifique os dados enviados.",

        // Erros de servidor
        unexpected_failure: "Erro inesperado no servidor. Tente novamente mais tarde.",
        service_timeout: "Serviço indisponível no momento. Tente novamente mais tarde.",
        server_error: "Erro interno do servidor. Tente novamente mais tarde.",

        // Erros de captcha
        captcha_failed: "Verificação do captcha falhou. Tente novamente.",

        // Erros de hook
        hook_timeout: "Serviço temporariamente indisponível. Tente novamente mais tarde.",
        hook_timeout_after_retry: "Serviço indisponível. Tente novamente mais tarde.",

        // Erros gerais
        conflict: "Conflito de dados. Tente novamente.",
        bad_json: "Formato de dados inválido.",
        no_authorization: "Autorização necessária. Faça login primeiro.",
        not_admin: "Acesso restrito a administradores.",
    };

    // Retorna mensagem específica ou genérica
    return {
        error: errorMessages[errorCode] || "Ocorreu um erro inesperado. Por favor, tente novamente.",
    };
};
