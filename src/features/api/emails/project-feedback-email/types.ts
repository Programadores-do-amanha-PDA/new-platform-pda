export type TypeProjectFeedbackValues = {
  project_type: string;
  project_module: string;
  teacher_name: string;
  teacher_email: string;
  to_name: string;
  final_note: string;
  hits_itens?: { emoji: "🥇"; text: string }[] | string;
  improvements_itens?: { emoji: "🗡️"; text: string }[] | string;
  rubric_itens: {
    label: string;
    text: string;
  }[];
  final_considerations: string;
  next_itens?: { emoji: "👨‍🚀"; text: string }[];
};

export interface ProjectFeedbackTemplateT {
  htmlTemplate: {
    text: string;
    keys: string[];
  };
  values: TypeProjectFeedbackValues;
}
