export interface ClassTypesLimit {
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

export interface ClassTypes {
  id: string;
  title: string;
  limits: Array<ClassTypesLimit>;
  presence_calc_type: "bySingleMeeting" | "byWeeklyMeetings";
  created_at?: string;
  updated_at?: string;
}

export interface ClassTypesFormLimit {
  id: string;
  title: string;
  key: string;
  color: string;
  min: number;
  max?: number;
  allowJustification: boolean;
  isPresence: boolean;
}

export interface ClassTypesFormData {
  title: string;
  limits: Array<ClassTypesFormLimit>;
  presenceCalcType: "bySingleMeeting" | "byWeeklyMeetings";
}
