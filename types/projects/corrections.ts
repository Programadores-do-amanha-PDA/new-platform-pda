export type ClassroomProjectCorrectionRulesSelectedT = {
  rule: string;
  ruleL: string;
  ruleNote: number;
};

export interface ClassroomProjectCorrectionT {
  id: string;
  project_id: string;
  delivery_id: string;
  rules_selected: ClassroomProjectCorrectionRulesSelectedT[];
  improvements_items: string[];
  hits_items: string[];
  next_items: string[];
  final_considerations: string;
  final_note: string;
  teacher_email: string;
  created_at: string;
}
