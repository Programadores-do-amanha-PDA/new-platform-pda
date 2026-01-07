import { ClassroomProject } from "./project";
import { ClassProjectCorrection, ClassroomProjectDelivery } from "..";

/**
 * Props interface for the ProjectCard component
 */
export interface ProjectCardPropsT {
  /** The project data to display */
  project: ClassroomProject;
  /** Whether to show expanded view with additional controls */
  expansive: boolean;
  /** The classroom ID for delivery modal */
  classroomId: string;
}

/**
 * Props interface for project status components
 */
export interface ProjectStatusPropsT {
  /** The project to display status for */
  project: ClassroomProject;
  /** Current user ID */
  userId?: string;
  /** Function to open delivery modal */
  onOpenDeliveryModal: () => void;
}

/**
 * Props interface for project admin controls
 */
export interface ProjectAdminControlsPropsT {
  project: ClassroomProject;
  classroomDeliveries: ClassroomProjectDelivery[];
  classroomCorrections: ClassProjectCorrection[];
}

/**
 * Project card display modes
 */
export type ProjectCardModeT = "compact" | "expanded" | "admin";

/**
 * Project card theme variants
 */
export type ProjectCardVariantT =
  | "default"
  | "active"
  | "completed"
  | "expired";

export interface ProjectStatusRendererPropsT {
  project: ClassroomProject;
  classroomId: string;
  classroomDeliveries: ClassroomProjectDelivery[];
  classroomCorrections: ClassProjectCorrection[];
  onOpenDeliveryModal?: (delivery: ClassroomProjectDelivery | null) => void;
}
