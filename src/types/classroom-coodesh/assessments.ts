import { DateRange } from "react-day-picker";
import { ParticipantDataT } from "./attempts";

export interface AssessmentPayloadQuestionT {
  name: string;
  description: string;
  type: string;
  type_formatted: string;
  level?: string;
  level_formatted?: string;
  duration: number;
  duration_unit: string;
}

export interface AssessmentPayloadT {
  assessment_id: string;
  name: string;
  description: string;
  default_locale?: "pt" | "en" | "es" | string;
  duration: number;
  duration_unit: string;
  questions: AssessmentPayloadQuestionT[];
}

export interface AssessmentT {
  offset?: number;
  total?: number;
  limit?: number;
  payload: AssessmentPayloadT[];
}

export type ClassroomCoodeshAssessmentT = {
  id?: string;
  assessment_id: string;
  classroom_id: string;
  participants_data?: ParticipantDataT[];
  schedule_date?: DateRange | undefined;
  is_visible_on_schedule?: boolean;
  accept_late_deliveries?: boolean;
  created_at: string;
  updated_at?: string;
} & AssessmentPayloadT;
