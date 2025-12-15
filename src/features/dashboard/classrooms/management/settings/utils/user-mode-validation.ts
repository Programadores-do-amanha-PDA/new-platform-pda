import { z } from "zod/mini";

/**
 * Validation schema for user mode form data
 * Ensures data integrity and provides clear error messages
 */
export const UserModeFormSchema = z.object({
    title: z.string().check(z.minLength(1, "Título é obrigatório")),
    key: z.string().check(z.minLength(1, "Identificador é obrigatório")),
    color: z.string().check(z.regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido")),
    featuresRules: z.array(
        z.object({
            id: z.string().check(z.minLength(1, "ID é obrigatório")),
            isVisible: z.optional(z.boolean()),
            aggregateInMetric: z.optional(z.boolean()),
        }),
    ),
});

export type UserModeFormSchemaT = z.infer<typeof UserModeFormSchema>;
