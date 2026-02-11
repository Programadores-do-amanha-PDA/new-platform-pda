import { ClassroomProjectType, ProjectTypeLabel } from "../../types/projects/project";

export const projectTypesLabels: Record<ClassroomProjectType, ProjectTypeLabel> = {
  mini_project: { label: "Mini projeto", iconName: "code" },
  end_module_project: { label: "Projeto final", iconName: "braces" },
  end_module_english_project: {
    label: "English final project",
    iconName: "languages",
  },
};