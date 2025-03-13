export type AssessmentPayloadQuestionType = {
  name: string;
  description: string;
  type: string;
  type_formatted: string;
  level: string;
  level_formatted: string;
  duration: number;
  duration_unit: string;
};

export type AssessmentPayloadType = {
  assessment_id: string;
  name: string;
  description: string;
  default_locale: string;
  duration: number;
  duration_unit: string;
  questions: AssessmentPayloadQuestionType[];
};

export type AssessmentType = {
  offset: number;
  total: number;
  limit: number;
  payload: AssessmentPayloadType[];
};

export type TeamCoodeshAssessments = {
  id?: number;
  assessment_id: string;
  team_id: string;
  created_at: string;
};