import { RolesT } from "@/types/auth";
import { RolesLabelsE } from "@/types/auth/enum/roles";

export const rolesLabelsOptions: { value: RolesT; label: string }[] = [
  { value: RolesLabelsE.ADMIN, label: "Administrador" },
  { value: RolesLabelsE.EMPLOYER, label: "Gerente de empregabilidade" },
  { value: RolesLabelsE.CLASS_MANAGER, label: "Gerente de turma" },
  { value: RolesLabelsE.STUDENT, label: "Estudante" },
  { value: RolesLabelsE.TEACHER, label: "Facilitador" },
  { value: RolesLabelsE.ALUMNI, label: "Alumni" },
];
