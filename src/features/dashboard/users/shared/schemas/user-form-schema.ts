import { z } from "zod";
import { REGEX_FOR_EMAIL_VALIDATION, REGEX_FOR_PASSWORD_VALIDATION } from "@/utils/regex/user-regex-validations";

export const userFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(5, "Nome deve ter pelo menos 5 caracteres")
    .refine(
      (name) => name.trim().split(" ").length >= 2,
      "Nome completo deve conter pelo menos nome e sobrenome"
    ),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .toLowerCase()
    .refine(
      (email) => REGEX_FOR_EMAIL_VALIDATION.test(email),
      "Email deve ter um formato válido"
    ),
  password: z
    .string()
    .optional()
    .refine(
      (password) => !password || REGEX_FOR_PASSWORD_VALIDATION.test(password),
      "Senha deve atender aos critérios de segurança"
    ),
  userRole: z.string().default(""),
  enrollments: z.array(z.string()).default([]),
});

export const newUserFormSchema = userFormSchema.extend({
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .refine(
      (password) => REGEX_FOR_PASSWORD_VALIDATION.test(password),
      "Senha deve atender aos critérios de segurança"
    ),
});

export type UserFormData = z.infer<typeof userFormSchema>;
export type NewUserFormData = z.infer<typeof newUserFormSchema>;
