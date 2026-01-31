export enum RolesLabels {
    ADMIN = "admin",
    EMPLOYER = "employer",
    CLASS_MANAGER = "class_manager",
    STUDENT = "student",
    TEACHER = "teacher",
    ALUMNI = "alumni",
    GUEST = "guest",
}

export type Role = (typeof RolesLabels)[keyof typeof RolesLabels];

export interface UserRole {
    id?: number;
    role: Role;
    user_id?: string;
}
