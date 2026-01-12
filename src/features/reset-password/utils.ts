import { REGEX_FOR_EMAIL_VALIDATION, REGEX_FOR_PASSWORD_VALIDATION } from "@/utils/regex/user-regex-validations";
import { z } from "zod/mini";

/**
 * Password reset request validation schema
 */
export const requestResetPasswordByEmailSchema = z.object({
    email: z
        .email("Email deve ter um formato válido")
        .check(z.toLowerCase(), z.regex(REGEX_FOR_EMAIL_VALIDATION, "Email deve ter um formato válido")),
});

/**
 * New password validation schema
 * Includes password confirmation matching
 */
export const setNewPasswordSchema = z
    .object({
        password: z
            .string("Senha é obrigatória")
            .check(
                z.trim(),
                z.regex(
                    REGEX_FOR_PASSWORD_VALIDATION,
                    "Senha deve ter pelo menos 7 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais",
                ),
            ),
        confirmPassword: z
            .string("Confirmação de senha é obrigatória")
            .check(
                z.trim(),
                z.regex(
                    REGEX_FOR_PASSWORD_VALIDATION,
                    "Confirmação de senha deve ter pelo menos 7 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais",
                ),
            ),
    })
    .check(
        z.refine((data) => data.password === data.confirmPassword, {
            message: "As senhas não coincidem",
            path: ["confirmPassword"],
        }),
    );
