import z from "zod";

export const classroomFormSchema = z.object({
    name: z
        .string()
        .min(1, "Nome é obrigatório")
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(50, "Nome deve ter no máximo 50 caracteres"),
    period: z.enum(["morning", "afternoon", "evening"]).nullable(),
    status: z.enum(["created", "active", "finished"], {
        message: "Status é obrigatório",
    }),
    icon: z.string().min(1, "Ícone é obrigatório"),
});

export type ClassroomFormData = z.infer<typeof classroomFormSchema>;
