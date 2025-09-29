import { z } from "zod";
import { ClassroomProjectDeliveryT, ClassroomProjectT } from ".";

export const projectCorrectionFormSchema = z.object({
  teacherName: z.string().optional(),
  teacherEmail: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.email().safeParse(val).success,
      "E-mail inválido"
    ),
  rulesSelected: z
    .array(
      z.object({
        rule: z.string(),
        ruleL: z.string(),
        ruleNote: z.number(),
      })
    )
    .min(1, "É preciso selecionar pelo menos uma regra"),
  hits: z.object({
    item1: z.string().min(1, "É obrigatório preencher um ponto forte"),
    item2: z.string().optional(),
    item3: z.string().optional(),
  }),
  improvements: z.object({
    item1: z.string().min(1, "É obrigatório preencher ponto de melhoria"),
    item2: z.string().optional(),
    item3: z.string().optional(),
  }),
  next: z.object({
    item1: z.string().min(1, "É obrigatório preencher um proximo passo"),
    item2: z.string().optional(),
    item3: z.string().optional(),
  }),
  finalNote: z.string().min(1, "Nota final é obrigatória"),
  feedback: z.string().min(1, "Considerações finais são obrigatórias"),
});

export type ProjectCorrectionFormT = z.infer<
  typeof projectCorrectionFormSchema
>;

export interface ProjectCorrectionPropsT {
  classroomId: string;
  selectedDelivery: ClassroomProjectDeliveryT;
  project: ClassroomProjectT;
  handleClose: () => void;
}
