import { z } from "zod/mini";
import { REGEX_FOR_PASSWORD_VALIDATION } from "@/utils/regex/user-regex-validations";

/**
 * Login form validation schema
 * Ensures email format and password requirements
 */

export const signInSchema = z.object({
    email: z.email("Email deve ter um formato válido").check(z.toLowerCase(), z.trim()),

    password: z
        .string()
        .check(
            z.minLength(6, "Senha deve ter pelo menos 6 caracteres"),
            z.trim(),
            z.regex(REGEX_FOR_PASSWORD_VALIDATION, "Senha não pode conter espaços em branco"),
        ),
});
