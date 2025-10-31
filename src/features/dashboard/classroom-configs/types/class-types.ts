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

export interface ClassroomConfigClassTypesT {
  id: string;
  title: string;
  limits: Array<ClassroomConfigClassTypesLimitT>;
  presence_calc_type: "bySingleMeeting" | "byWeeklyMeetings";
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomConfigClassTypesFormLimitT {
  id: string;
  title: string;
  key: string;
  color: string;
  min: number;
  max?: number;
  allowJustification: boolean;
  isPresence: boolean;
}

export interface ClassroomConfigClassTypesFormDataT {
  title: string;
  limits: Array<ClassroomConfigClassTypesFormLimitT>;
  presenceCalcType: "bySingleMeeting" | "byWeeklyMeetings";
}
