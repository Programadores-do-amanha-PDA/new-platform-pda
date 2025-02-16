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
  id: number;
  job_id: string;
  user_id?: string;
  status: "applied" | "rejected" | "accepted";
  created_at: string;
  updated_at?: string;
};

export type JobApplicationWithJob = JobApplication & { job?: JobType };
