import { DateRange } from "react-day-picker";
import { ParticipantData } from "./attempts";

export type AssessmentPayloadQuestionType = {
  name: string;
  description: string;
  type: string;
  type_formatted: string;
  level?: string;
  level_formatted?: string;
  duration: number;
  duration_unit: string;
};

export type AssessmentPayloadType = {
  assessment_id: string;
  name: string;
  description: string;
  default_locale?: "pt" | "en" | "es" | string;
  duration: number;
  duration_unit: string;
  questions: AssessmentPayloadQuestionType[];
};

export type AssessmentType = {
  offset?: number;
  total?: number;
  limit?: number;
  payload: AssessmentPayloadType[];
};

export type ClassroomCoodeshAssessment = {
  id?: string;
  assessment_id: string;
  classroom_id: string;
  participants_data?: ParticipantData[];
  schedule_date?: DateRange | undefined;
  is_visible_on_schedule?: boolean;
  accept_late_deliveries?: boolean;
  created_at: string;
  updated_at?: string;
} & AssessmentPayloadType;
