export type ActivityClassTypes =
  | "programming"
  | "english"
  | "soft-skills"
  | "community";

export interface ActivityJustification {
  id?: string;
  user_email: string;
  message: string;
}

export interface ClassActivity {
  id: string;
  classroom_id: string;
  class_type?: ActivityClassTypes;
  participants_email?: string[];
  is_visible_on_schedule?: boolean;
  created_at: string;
  updated_at?: string;
  justifications?: ActivityJustification[];
}
