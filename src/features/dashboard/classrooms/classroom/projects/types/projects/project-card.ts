import { ClassroomProject } from "./project";
import { ClassroomProjectCorrection, ClassroomProjectDelivery } from "..";

/**
 * Props interface for the ProjectCard component
 */
export interface ProjectCardPropsT {
  /** The project data to display */
  project: ClassroomProject;
  /** Whether the card should be displayed in expanded mode */
  expansive: boolean;
  /** The unique identifier of the classroom */
  classroomId: string;
}

/**
 * Props interface for project status components
 */
export interface ProjectStatusPropsT {
  /** The project data to display status for */
  project: ClassroomProject;
  /** Optional user ID to check delivery status */
  userId?: string;
  /** Callback function to open the delivery submission modal */
  onOpenDeliveryModal: () => void;
}

/**
 * Props interface for project admin controls
 */
export interface ProjectAdminControlsPropsT {
  /** The project data for admin management */
  project: ClassroomProject;
  /** List of all deliveries submitted for this project */
  classroomDeliveries: ClassroomProjectDelivery[];
  /** List of all corrections made for this project */
  classroomCorrections: ClassroomProjectCorrection[];
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
  /** The project data to render status for */
  project: ClassroomProject;
  /** The unique identifier of the classroom */
  classroomId: string;
  /** List of all deliveries submitted for this project */
  classroomDeliveries: ClassroomProjectDelivery[];
  /** List of all corrections made for this project */
  classroomCorrections: ClassroomProjectCorrection[];
  /** Optional callback function to open delivery modal with specific delivery data */
  onOpenDeliveryModal?: (delivery: ClassroomProjectDelivery | null) => void;
}
