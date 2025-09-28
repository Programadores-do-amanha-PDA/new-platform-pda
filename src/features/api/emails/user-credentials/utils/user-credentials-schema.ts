import { z } from "zod";

export const userCredentialsSchema = z.object({
  email: z.email("Email inválido"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  values: z.object({
    username: z.string().min(3),
    password: z.string().min(8),
  }),
  auth: z.object({
    user: z.string().email(),
    pass: z.string().min(1),
  }),
});

export type UserCredentialsInput = z.infer<typeof userCredentialsSchema>;
