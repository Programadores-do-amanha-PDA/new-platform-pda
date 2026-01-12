import { z } from "zod/mini";
import {
    REGEX_FOR_EMAIL_VALIDATION,
    REGEX_FOR_FULL_NAME_VALIDATION,
    REGEX_FOR_PASSWORD_VALIDATION,
} from "@/utils/regex/user-regex-validations";

export const profileFormSchema = z
    .object({
        fullName: z
            .string()
            .check(
                z.trim(),
                z.regex(
                    REGEX_FOR_FULL_NAME_VALIDATION,
                    "Seu nome completo deve conter no mínimo 4 caracteres e 2 partes obrigatórias",
                ),
            ),
        email: z
            .email("Email deve ter um formato válido")
            .check(z.toLowerCase(), z.regex(REGEX_FOR_EMAIL_VALIDATION, "Email deve ter um formato válido")),
        newPassword: z.optional(
            z
                .string()
                .check(
                    z.trim(),
                    z.regex(
                        REGEX_FOR_PASSWORD_VALIDATION,
                        "Senha deve ter pelo menos 7 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais",
                    ),
                ),
        ),
        confirmNewPassword: z.optional(
            z
                .string()
                .check(
                    z.trim(),
                    z.regex(
                        REGEX_FOR_PASSWORD_VALIDATION,
                        "Confirmação de senha deve ter pelo menos 7 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais",
                    ),
                ),
        ),
        bio: z.optional(z.string().check(z.maxLength(190, "A Biografia não pode exceder 190 caracteres"))),
    })
    .check(
        z.refine(
            (data) => {
                if (data.newPassword && data.confirmNewPassword) {
                    return data.newPassword === data.confirmNewPassword;
                }
                return true;
            },
            {
                message: "As senhas não coincidem",
                path: ["confirmNewPassword"],
            },
        ),
    );
