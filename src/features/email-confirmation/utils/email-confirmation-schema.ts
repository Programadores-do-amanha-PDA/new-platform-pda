import { z } from "zod/mini";
import { REGEX_FOR_EMAIL_VALIDATION } from "@/utils/regex/user-regex-validations";

/**
 * Email confirmation resend validation schema
 */
export const emailConfirmationSchema = z.object({
    email: z
        .email("Email deve ter um formato válido")
        .check(z.toLowerCase(), z.trim(), z.regex(REGEX_FOR_EMAIL_VALIDATION, "Email é inválido")),
});
