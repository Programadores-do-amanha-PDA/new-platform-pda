export type JobType = {
  id: string;
  title: string;
  company: string;
  description?: string;
  link: string;
  details?: JobDetailsType;
  created_at?: string;
  updated_at?: string;
  curated?: boolean;
};

export type JobDetailsType = {
  locale: string[];
  workplace_type: string[];
  languages: string[];
};
