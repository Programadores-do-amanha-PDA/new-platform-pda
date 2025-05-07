import { LucideIcon } from "lucide-react";
import { ClassroomCoodeshAssessment } from "./coodesh/assessments";

export type ClassroomTypeStatus = "created" | "active" | "finished";
export type ClassroomPeriodsType = "morning" | "afternoon" | "evening";

export type ClassroomType = {
  id: string;
  icon?: LucideIcon;
  name: string;
  period: ClassroomPeriodsType;
  status: ClassroomTypeStatus;
  created_at: string;
  updated_at: string | null;
  classroom_coodesh_assessments?: ClassroomCoodeshAssessment[];
};
