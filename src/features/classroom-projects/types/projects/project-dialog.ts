import { DateRange } from "react-day-picker";
import { ClassroomProject } from "./project";
import { createProjectSchema } from "../../utils/projects/project-dialog-helpers";
import z from "zod";

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
  currentProject?: ClassroomProject;
}

/**
 * Project dialog state interface
 */
export interface ProjectDialogStateT {
  isDialogOpen: boolean;
  loading: boolean;
}

export type ProjectFormSchemaT = z.infer<typeof createProjectSchema>;
