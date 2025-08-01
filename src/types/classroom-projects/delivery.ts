export interface ClassroomProjectDeliveryT {
  id: string;
  project_id: string;
  members: string[];
  links: string[];
  observation: string;
  created_at: string;
  lastCorrection?: string | null;
}
