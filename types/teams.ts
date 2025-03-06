import { LucideIcon } from "lucide-react";

export type TeamTypeStatus = "created" | "active" | "finished";

export type TeamType = {
  id: number;
  icon?: LucideIcon;
  name: string;
  period: string | null;
  status: TeamTypeStatus;
  created_at: string;
  updated_at: string | null;
};
