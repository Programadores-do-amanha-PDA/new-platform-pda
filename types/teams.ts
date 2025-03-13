import { LucideIcon } from "lucide-react";
import { TeamCoodeshAssessments } from "./assessments";

export type TeamTypeStatus = "created" | "active" | "finished";
export type TeamPeriodsType = "morning" | "afternoon" | "evening";

export type TeamType = {
  id: string;
  icon?: LucideIcon;
  name: string;
  period: TeamPeriodsType;
  status: TeamTypeStatus;
  created_at: string;
  updated_at: string | null;
  team_coodesh_assessments?: TeamCoodeshAssessments[]
};
