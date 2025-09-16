export type StudentAttendanceIndicators = {
  [presenceId: string]: number;
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
  attendances: StudentAttendanceIndicators;
  activities: number;
  coodesh: StudentCoodeshIndicators;
  projects: StudentProjectIndicators;
};

export type ClassroomOverviewData = {
  students: StudentOverview[];
    classTypes: Array<{
    id: string;
    name: string;
  }>;
  coodeshTests: Array<{
    id: string;
    name: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
  }>;
};
