import { ClassroomProjectTypeT } from "../types/project";

export interface ProjectTypeLabelT {
  label: string;
  iconName: string;
}

export const projectTypesLabels: Record<ClassroomProjectTypeT, ProjectTypeLabelT> = {
  mini_project: { label: "Mini projeto", iconName: "code" },
  end_module_project: { label: "Projeto final", iconName: "braces" },
  end_module_english_project: {
    label: "English final project",
    iconName: "languages",
  },
};