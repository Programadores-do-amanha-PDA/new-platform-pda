import { z } from "zod";

/**
 * Login form validation schema
 * Ensures email format and password requirements
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

/**
 * Password reset request validation schema
 */
export const resetPasswordSchema = z.object({
  email: z
    .email("Email deve ter um formato válido")
    .min(1, "Email é obrigatório")
    .toLowerCase(),
});

/**
 * Email confirmation resend validation schema
 */
export const resendConfirmationSchema = z.object({
  email: z
    .email("Email deve ter um formato válido")
    .min(1, "Email é obrigatório")
    .toLowerCase(),
});

/**
 * New password validation schema
 * Includes password confirmation matching
 */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"
      ),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
