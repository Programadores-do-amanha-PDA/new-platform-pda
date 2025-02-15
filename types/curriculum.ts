export type CurriculumLocationType = { state: string; city: string };

export type CurriculumInterestingAreasType = {
  area: string;
  technologies: string[];
}[];

export type CurriculumStudiesType = {
  institution: string;
  degree: string;
  study_field: string;
  start_date: string;
  end_date: string;
}[];

export type CurriculumType = {
  id?: number;
  user_id?: string;
  location?: CurriculumLocationType;
  interesting_areas?: CurriculumInterestingAreasType;
  studies?: CurriculumStudiesType;
  created_at?: Date;
  updated_at?: Date;
};
