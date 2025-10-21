import { AuthUserWithProfileT } from "@/types";

export interface ClassroomProjectDeliveryT {
  id: string;
  project_id: string;
  classroom_id: string;
  user_id: string;
  members: string[];
  members_id: string[];
  links: string[];
  observation: string;
  lastCorrection?: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Represents a grouped delivery with associated user and squad information
 */
export interface GroupedDelivery {
  /** Primary user ID who submitted the delivery */
  userId: string;
  /** Primary user object with profile information */
  user?: Partial<AuthUserWithProfileT>;
  /** Array of deliveries belonging to this group */
  deliveries: ClassroomProjectDeliveryT[];
  /** Array of all squad member IDs (including primary user and collaborators) */
  squadMembers: string[];
}

/**
 * Delivery grouping configuration options
 */
export interface GroupDeliveriesOptions {
  /** Whether to include email members in squad membership */
  includeEmailMembers?: boolean;
  /** Custom sorting function for squad members */
  memberSortFunction?: (a: string, b: string) => number;
}
