import { z } from "zod";

export const userCredentialsValuesSchema = z.object({
  to_name: z.string().min(1, "Recipient name is required"),
  to_email: z.email("Valid email is required"),
  short_ids: z.array(z.string()).min(1, "At least one short ID is required"),
});

export const userCredentialsSchema = z.object({
  email: z.email("Email inválido"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  values: userCredentialsValuesSchema,
});

export type UserCredentialsInput = z.infer<typeof userCredentialsSchema>;