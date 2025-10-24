import { z } from "zod";

/**
 * Validation schema for user mode form data
 * Ensures data integrity and provides clear error messages
 */
export const UserModeFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  key: z.string().min(1, "Identificador é obrigatório"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido"),
  featuresRules: z.array(
    z.object({
      id: z.string().min(1, "ID é obrigatório"),
      isVisible: z.boolean(),
      aggregateInMetric: z.boolean(),
    })
  ),
});

export type UserModeFormSchemaT = z.infer<typeof UserModeFormSchema>;