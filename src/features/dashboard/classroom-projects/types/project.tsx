import { DateRange } from "react-day-picker";

export type ClassroomProjectModuleT =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | string;

export type ClassroomProjectTypeT =
  | "mini_project"
  | "end_module_project"
  | "end_module_english_project";

export interface ClassroomProjectT {
  id: string;
  classroom_id: string;
  title: string;
  module: ClassroomProjectModuleT;
  project_type: ClassroomProjectTypeT;
  schedule_date:
    | DateRange
    | { from: Date; to?: Date | undefined }
    | undefined;
  closing_time?: string;
  description?: string;
  created_at: string;
}
