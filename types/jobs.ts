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

export type JobApplication = {
  id?: string;
  job_id: string;
  user_id?: string;
  status: "applied" | "pending" | "rejected";
  created_at?: string;
  updated_at?: string;
};
