import { RolesType } from "@/types/auth-types";

export const rolesLabels: { value: RolesType; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "employer", label: "Gerente de empregabilidade" },
  { value: "class_manager", label: "Gerente de turma" },
  { value: "student", label: "Estudante" },
  { value: "teacher", label: "Facilitador" },
  { value: "alumni", label: "Alumni" },
];
