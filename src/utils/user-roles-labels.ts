import { Role, RolesLabels } from "@/types";

export const rolesLabelsOptions: { value: Role; label: string }[] = [
  { value: RolesLabels.ADMIN, label: "Administrador" },
  { value: RolesLabels.EMPLOYER, label: "Gerente de empregabilidade" },
  { value: RolesLabels.CLASS_MANAGER, label: "Gerente de turma" },
  { value: RolesLabels.STUDENT, label: "Estudante" },
  { value: RolesLabels.TEACHER, label: "Facilitador" },
  { value: RolesLabels.ALUMNI, label: "Alumni" },
];
