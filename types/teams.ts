import { LucideIcon } from "lucide-react";

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
};
