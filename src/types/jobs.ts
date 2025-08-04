export interface JobT {
  id: string;
  title: string;
  company: string;
  description?: string;
  link: string;
  details?: JobDetailsT;
  created_at?: string;
  updated_at?: string;
  curated?: boolean;
  is_archived?: boolean;
  is_on_discord?: boolean;
}

export interface JobDetailsT {
  locale: string[];
  workplace_type: string[];
  languages: string[];
};

export type JobApplicationStatusT = "applied" | "rejected" | "accepted";

export interface JobApplicationT {
  id: number;
  job_id: string;
  user_id?: string;
  status: JobApplicationStatusT;
  created_at: string;
  updated_at?: string;
}

export type JobApplicationWithJobT = JobApplicationT & { jobs?: JobT };

export type JobWithApplicationsT = JobT & { applications?: JobApplicationT[] };
