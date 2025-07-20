import { z } from "zod";
import { emailRegex, passwordRegex } from "@/utils/regex/users";

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
      (email) => emailRegex.test(email),
      "Email deve ter um formato válido"
    ),
  password: z
    .string()
    .optional()
    .refine(
      (password) => !password || passwordRegex.test(password),
      "Senha deve atender aos critérios de segurança"
    ),
  userRoles: z.array(z.string()).default([]),
  userClassrooms: z.array(z.string()).default([]),
});

export const newUserFormSchema = userFormSchema.extend({
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .refine(
      (password) => passwordRegex.test(password),
      "Senha deve atender aos critérios de segurança"
    ),
});

export type UserFormData = z.infer<typeof userFormSchema>;
export type NewUserFormData = z.infer<typeof newUserFormSchema>;
