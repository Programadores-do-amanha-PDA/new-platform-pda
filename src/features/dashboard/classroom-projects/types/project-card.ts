import { ClassroomConfigT } from "@/types";
import { ClassroomProjectT } from "./project";

/**
 * Props interface for the ProjectCard component
 */
export interface ProjectCardProps {
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
export interface ProjectStatusProps {
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
export interface ProjectAdminControlsProps {
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
export type ProjectCardMode = 'compact' | 'expanded' | 'admin';

/**
 * Project card theme variants
 */
export type ProjectCardVariant = 'default' | 'active' | 'completed' | 'expired';