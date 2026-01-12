/**
 * Valida endereços de email.
 * 
 * Padrão aceito:
 * - Suporta domínios com pontos e subdomínios
 * - Aceita nomes com pontos, hífens e números
 * - Valida extensões de domínio
 */
export const REGEX_FOR_EMAIL_VALIDATION =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Valida senhas com requisitos de segurança.
 * 
 * Requisitos:
 * - Mínimo 7 caracteres
 * - Pelo menos uma letra minúscula
 * - Pelo menos uma letra maiúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial: !@#$%^&*()_+=[]{}|;:'",.<>?/~`-
 */
export const REGEX_FOR_PASSWORD_VALIDATION =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-])[A-Za-z\d!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-]{7,}$/;

/**
 * Valida nomes completos.
 * 
 * Requisitos:
 * - Primeira parte com mínimo 4 caracteres
 * - Mínimo 2 partes obrigatório (ex: John Doe)
 * - Apenas letras (a-zA-Z)
 * - Espaços simples entre as partes
 * - Case-insensitive
 * - Sem limite de partes
 */
export const REGEX_FOR_FULL_NAME_VALIDATION = /^[a-zA-Z]{4,}(?: [a-zA-Z]+)+$/;
