import z from "zod";

export const ClassroomConfigClassTypesLimitSchema = z.object({
  id: z.string().min(1, "id é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  key: z.string().min(1, "Identificador é obrigatório"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido"),
  min: z.number().min(0, "Mínimo deve ser maior ou igual a 0"),
  max: z.number().min(0, "Máximo deve ser maior ou igual a 0").optional(),
  allowJustification: z.boolean(),
  isPresence: z.boolean(),
});

export const ClassroomConfigClassTypesSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  limits: z
    .array(ClassroomConfigClassTypesLimitSchema)
    .min(1, "Pelo menos um limite é obrigatório"),
  presenceCalcType: z.enum(["bySingleMeeting", "byWeeklyMeetings"], {
    message: "Tipo de cálculo de presença é obrigatório",
  }),
});
