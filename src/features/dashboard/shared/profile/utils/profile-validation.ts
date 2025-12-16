import { z } from "zod";
import { emailRegex, passwordRegex } from "@/utils/regex/users";

// Full name regex - at least 4 characters, letters only, max 3 words
export const fullNameRegex = /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/;

export const profileFormSchema = z
  .object({
    fullName: z
      .string()
      .min(4, "Nome deve ter pelo menos 4 caracteres")
      .refine(
        (name) => fullNameRegex.test(name),
        "Nome deve conter apenas letras e no máximo 3 palavras"
      ),
    email: z
      .string()
      .email("Email inválido")
      .refine(
        (email) => emailRegex.test(email),
        "Email deve ter um formato válido"
      ),
    newPassword: z
      .string()
      .optional()
      .refine(
        (password) => !password || passwordRegex.test(password),
        "Senha deve ter pelo menos 7 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais"
      ),
    confirmNewPassword: z.string().optional(),
    bio: z
      .string()
      .max(190, "Biografia não pode exceder 190 caracteres")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.confirmNewPassword) {
        return data.newPassword === data.confirmNewPassword;
      }
      return true;
    },
    {
      message: "Senhas não coincidem",
      path: ["confirmNewPassword"],
    }
  );
