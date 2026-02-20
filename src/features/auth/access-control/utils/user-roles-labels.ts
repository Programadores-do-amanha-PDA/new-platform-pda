import { Role, RolesLabels } from "@/features/auth/access-control/types";

export const rolesLabelsOptions: { value: Role; label: string }[] = [
    { value: RolesLabels.ADMIN, label: "Administrator" },
    { value: RolesLabels.EMPLOYER, label: "Employability Manager" },
    { value: RolesLabels.CLASS_MANAGER, label: "Class Manager" },
    { value: RolesLabels.STUDENT, label: "Student" },
    { value: RolesLabels.TEACHER, label: "Facilitator" },
    { value: RolesLabels.ALUMNI, label: "Alumni" },
    { value: RolesLabels.GUEST, label: "Guest" },
];
