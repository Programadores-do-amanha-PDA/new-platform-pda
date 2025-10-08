import { ClassroomConfigT } from "@/types";
import { ClassroomProjectT } from "./project";
import { DeliveryStatusResultT } from "..";

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

  classroomConfig?: ClassroomConfigT;
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
  /** The project to manage */
  project: ClassroomProjectT;
  /** Whether the project is currently active */
  isActive: boolean;
  /** Loading state for update operations */
  loading: boolean;
  /** Function to handle project updates */
  onUpdateProject: () => Promise<void>;
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
  /** The delivery status analysis result */
  deliveryStatus: DeliveryStatusResultT;
  /** The project title for accessibility labels */
  projectTitle: string;
  /** Function to open the delivery modal */
  onOpenDeliveryModal: () => void;
}
