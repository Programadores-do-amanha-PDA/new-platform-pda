import { z } from "zod/mini";

export const JustificationFormSchema = z.object({
    title: z.string().check(z.minLength(1, "Título é obrigatório")),
    key: z.string().check(z.minLength(1, "Identificador é obrigatório")),
    color: z.string().check(z.regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido")),
    isPresence: z.boolean(),
});

export type JustificationFormData = z.infer<typeof JustificationFormSchema>;
