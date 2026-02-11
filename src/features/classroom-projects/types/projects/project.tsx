import { DateRange } from "react-day-picker";

export type ClassroomProjectModuleT =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | string;

export type ClassroomProjectType =
  | "mini_project"
  | "end_module_project"
  | "end_module_english_project";

export interface ClassroomProject {
  id: string;
  classroom_id: string;
  title: string;
  module: ClassroomProjectModuleT;
  project_type: ClassroomProjectType;
  schedule_date:
    | DateRange
    | { from: Date | string; to?: Date | string | undefined }
    | undefined;
  description?: string;
  rule_id: string;
  cut_off_grade: number;
  recovery_schedule: DateRange | undefined;
  created_at: string;
}

export interface ProjectTypeLabel {
  label: string;
  iconName: string;
}

export interface ProjectTypeSelectPropsT
  extends React.HTMLAttributes<HTMLSelectElement> {
  value: ClassroomProjectType | "";
  onValueChange: (newValue: ClassroomProjectType) => void;
  name?: string;
  error?: boolean;
}