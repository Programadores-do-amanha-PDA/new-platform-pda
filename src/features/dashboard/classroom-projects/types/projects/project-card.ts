import { ClassroomProjectT } from "./project";
import { ClassroomProjectCorrectionT, ClassroomProjectDeliveryT } from "..";

/**
 * Props interface for the ProjectCard component
 */
export interface ProjectCardPropsT {
  /** The project data to display */
  project: ClassroomProjectT;
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
  project: ClassroomProjectT;
  /** Current user ID */
  userId?: string;
  /** Function to open delivery modal */
  onOpenDeliveryModal: () => void;
}

/**
 * Props interface for project admin controls
 */
export interface ProjectAdminControlsPropsT {
  project: ClassroomProjectT;
  classroomDeliveries: ClassroomProjectDeliveryT[];
  classroomCorrections: ClassroomProjectCorrectionT[];
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
  project: ClassroomProjectT;
  classroomId: string;
  classroomDeliveries: ClassroomProjectDeliveryT[];
  classroomCorrections: ClassroomProjectCorrectionT[];
  onOpenDeliveryModal?: (delivery: ClassroomProjectDeliveryT | null) => void;
}
