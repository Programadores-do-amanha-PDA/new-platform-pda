export type ActivityTClassT =
  | "programming"
  | "english"
  | "soft-skills"
  | "community";

export interface ClassroomActivityJustificationT {
  id?: string;
  user_email: string;
  message: string;
}

export interface ClassroomActivityT {
  id: string;
  classroom_id: string;
  class_type?: ActivityTClassT;
  participants_email?: string[];
  is_visible_on_schedule?: boolean;
  created_at: string;
  updated_at?: string;
  justifications?: ClassroomActivityJustificationT[];
}
