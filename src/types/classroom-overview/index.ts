export type SortOrder = "none" | "asc" | "desc";

export type StudentPresenceIndicators = {
  general: number;
  programming: number;
  english: number;
  softSkills: number;
};

export type StudentCoodeshIndicators = {
  [testId: string]: number;
};

export type StudentProjectIndicators = {
  [projectId: string]: number;
};

export type StudentOverview = {
  id: string;
  name: string;
  email: string;
  number: number;
  presence: StudentPresenceIndicators;
  activities: number;
  coodesh: StudentCoodeshIndicators;
  projects: StudentProjectIndicators;
};

export type ColumnVisibility = {
  [key: string]: boolean;
};

export type SortConfig = {
  key: string | null;
  direction: SortOrder;
};

export type ClassroomOverviewData = {
  students: StudentOverview[];
  coodeshTests: Array<{
    id: string;
    name: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
  }>;
};
