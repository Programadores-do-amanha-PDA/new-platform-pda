import { DateRange } from "react-day-picker";
import { z } from "zod";

export interface ClassroomConfigModulesT {
  id: string;
  title: string;
  interval: DateRange;
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomConfigClassTypesLimitT {
  id: string;
  title: string;
  key: string;
  color: string;
  min: number;
  max?: number;
  allow_justification: boolean;
  is_presence: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomConfigJustificationT {
  id: string;
  title: string;
  key: string;
  color: string;
  is_presence: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomConfigClassTypesT {
  id: string;
  title: string;
  limits: Array<ClassroomConfigClassTypesLimitT>;
  created_at?: string;
  updated_at?: string;
}

export interface UserModeFeatureRuleT {
  id: string;
  isVisible: boolean;
  aggregateInMetric: boolean;
}

export interface ClassroomConfigUserModeT {
  id: string;
  title: string;
  key: string;
  color: string;
  featuresRules: Array<UserModeFeatureRuleT>;
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomConfigT {
  id: string;
  classroom_id: string;
  modules: Array<ClassroomConfigModulesT>;
  class_types: Array<ClassroomConfigClassTypesT>;
  justifications: Array<ClassroomConfigJustificationT>;
  user_modes: Array<ClassroomConfigUserModeT>;
}

// Zod schemas
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
});

export type ClassroomConfigClassTypesFormData = z.infer<
  typeof ClassroomConfigClassTypesSchema
>;
