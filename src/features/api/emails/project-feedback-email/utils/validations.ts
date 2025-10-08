import { z } from "zod";

export const projectFeedbackValuesSchema = z.object({
  project_type: z.string().min(1, "Project type is required"),
  project_module: z.string().min(1, "Project module is required"),
  teacher_name: z.string().min(1, "Teacher's name is required"),
  teacher_email: z.email().min(1, "Valid email is required"),
  to_name: z.string().min(1, "Recipient name is required"),
  final_note: z.string().min(1, "Final note is required"),
  hits_itens: z
    .array(
      z.object({
        emoji: z.literal("🥇"),
        text: z.string().min(1, "This field cannot be empty"),
      })
    )
    .optional(),
  improvements_itens: z
    .array(
      z.object({
        emoji: z.literal("🗡️"),
        text: z.string().min(1, "This field cannot be empty"),
      })
    )
    .optional(),
  rubric_itens: z
    .array(
      z.object({
        label: z.string().min(1, "Label is required"),
        text: z.string().min(1, "Description is required"),
      })
    )
    .nonempty("At least one rubric item is required"),
  final_considerations: z.string().min(1, "Final considerations are required"),
  next_itens: z
    .array(
      z.object({
        emoji: z.literal("👨‍🚀"),
        text: z.string().min(1, "This field cannot be empty"),
      })
    )
    .optional(),
});

export const projectFeedbackSchema = z.object({
  email: z.email("Email inválido"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  template: z.string().min(1, "Template é obrigatório"),
  values: projectFeedbackValuesSchema,
});

export type ProjectFeedbackInput = z.infer<typeof projectFeedbackSchema>;
