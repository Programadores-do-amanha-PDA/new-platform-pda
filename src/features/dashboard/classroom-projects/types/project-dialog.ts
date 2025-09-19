import { DateRange } from "react-day-picker";
import { ClassroomProjectT } from "./project";

/**
 * Form data structure for project creation/editing
 */
export interface ProjectFormDataT {
  title: string;
  module: string;
  project_type: string;
  schedule_date?: DateRange;
}

/**
 * Props interface for the ProjectDialog component
 */
export interface ProjectDialogPropsT {
  /** The ID of the classroom this project belongs to */
  classroom_id: string;
  /** The current project being edited (optional for create mode) */
  currentProject?: ClassroomProjectT;
}

/**
 * Project dialog state interface
 */
export interface ProjectDialogStateT {
  isDialogOpen: boolean;
  loading: boolean;
}