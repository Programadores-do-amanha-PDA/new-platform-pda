export interface ClassroomProjectDeliveryT {
  id: string;
  project_id: string;
  user_id: string;
  members: string[];
  members_id: string[];
  links: string[];
  observation: string;
  created_at: string;
  lastCorrection?: string | null;
}
