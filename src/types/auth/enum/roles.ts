import { RolesT } from "@/types/auth";

export const rolesLabels: { value: RolesT; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "employer", label: "Gerente de empregabilidade" },
  { value: "class_manager", label: "Gerente de turma" },
  { value: "student", label: "Estudante" },
  { value: "teacher", label: "Facilitador" },
  { value: "alumni", label: "Alumni" },
];
