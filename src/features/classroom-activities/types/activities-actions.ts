import { ClassActivity } from ".";

export type GetAllActivitiesByClassroomIdProps = {
    classroomId: string;
};
export type GetAllActivitiesByClassroomIdResult = ClassActivity[] | null;

export type GetActivityByIdProps = {
    id: string;
};
export type GetActivityByIdResult = ClassActivity | null;

export type CreateActivityProps = {
    activityData: Partial<Omit<ClassActivity, "id" | "created_at">>;
};
export type CreateActivityResult = ClassActivity | null;

export type UpdateActivityByIdProps = {
    id: string;
    updates: Partial<Omit<ClassActivity, "id" | "created_at">>;
};
export type UpdateActivityByIdResult = ClassActivity | null;

export type CreateMultipleActivitiesProps = {
    activitiesData: Partial<Omit<ClassActivity, "id" | "created_at">>[];
};
export type CreateMultipleActivitiesResult = ClassActivity[] | null;

export type DeleteActivityByIdProps = {
    id: string;
};
export type DeleteActivityByIdResult = boolean;