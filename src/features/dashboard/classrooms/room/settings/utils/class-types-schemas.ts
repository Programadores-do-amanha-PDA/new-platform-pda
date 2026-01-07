import { z } from "zod/mini";

export const ClassroomConfigClassTypesLimitSchema = z.object({
    id: z.string().check(z.minLength(1, "id é obrigatório")),
    title: z.string().check(z.minLength(1, "Título é obrigatório")),
    key: z.string().check(z.minLength(1, "Identificador é obrigatório")),
    color: z.string().check(z.regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido")),
    min: z.number().check(z.minimum(0, "Mínimo deve ser maior ou igual a 0")),
    max: z.optional(z.number().check(z.minimum(0, "Máximo deve ser maior ou igual a 0"))),
    allowJustification: z.boolean(),
    isPresence: z.boolean(),
});

export const ClassTypesSchema = z.object({
    title: z.string().check(z.minLength(1, "Título é obrigatório")),
    limits: z.array(ClassroomConfigClassTypesLimitSchema).check(z.minLength(1, "Pelo menos um limite é obrigatório")),
    presenceCalcType: z.enum(["bySingleMeeting", "byWeeklyMeetings"], {
        message: "Tipo de cálculo de presença é obrigatório",
    }),
});
