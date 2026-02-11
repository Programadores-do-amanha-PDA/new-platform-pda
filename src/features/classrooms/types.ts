export type ClassroomStatusT = "created" | "active" | "finished";
export type ClassroomPeriodsT = "morning" | "afternoon" | "evening" | null;

export type Classroom = {
  id: string;
  icon: string;
  name: string;
  period: ClassroomPeriodsT;
  status: ClassroomStatusT;
  created_at: string;
  updated_at: string | null;
};
