export interface ClassroomProjectCorrectionRulesSelectedT {
  rule: string;
  ruleL: string;
  ruleNote: number;
}

export interface ClassroomProjectCorrectionT {
  id: string;
  classroom_id: string;
  project_id: string;
  delivery_id: string;
  rules_selected: ClassroomProjectCorrectionRulesSelectedT[];
  improvements_itens: string[];
  hits_itens: string[];
  next_itens: string[];
  final_considerations: string;
  final_note: string;
  teacher_email: string;
  teacher_id: string;
  created_at: string;
}
