export type ResumeLocationT = { state: string; city: string };

export interface ResumeInterestingAreasT {
  area: string;
  technologies: string[];
}

export interface ResumeStudiesT {
  institution: string;
  degree: string;
  study_field: string;
  start_date: string;
  end_date: string;
}

export interface ResumeT {
  id?: string;
  user_id?: string;
  location?: ResumeLocationT;
  interesting_areas?: ResumeInterestingAreasT[];
  studies?: ResumeStudiesT[];
  created_at?: Date;
  updated_at?: Date;
}
