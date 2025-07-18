import { LucideIcon } from "lucide-react";

export type ClassroomTStatus = "created" | "active" | "finished";
export type ClassroomPeriodsType = "morning" | "afternoon" | "evening";

export type ClassroomT = {
  id: string;
  icon?: LucideIcon;
  name: string;
  period: ClassroomPeriodsType;
  status: ClassroomTStatus;
  created_at: string;
  updated_at: string | null;
};
