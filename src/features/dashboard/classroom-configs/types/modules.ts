import { DateRange } from "react-day-picker";

export interface ClassroomConfigModulesT {
  id: string;
  title: string;
  interval: DateRange;
  created_at?: string;
  updated_at?: string;
}

/**
 * Props interface for ModulesList component
 */
export interface ModulesListPropsT {
  /** The ID of the classroom to display modules for */
  classroomId: string;
}
