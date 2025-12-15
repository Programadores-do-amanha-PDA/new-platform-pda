import { Activity } from ".";

export type GetAllActivitiesByClassroomIdProps = {
    classroomId: string;
};
export type GetAllActivitiesByClassroomIdResult = Activity[] | null;

export type GetActivityByIdProps = {
    id: string;
};
export type GetActivityByIdResult = Activity | null;

export type CreateActivityProps = {
    activityData: Partial<Omit<Activity, "id" | "created_at">>;
};
export type CreateActivityResult = Activity | null;

export type UpdateActivityByIdProps = {
    id: string;
    updates: Partial<Omit<Activity, "id" | "created_at">>;
};
export type UpdateActivityByIdResult = Activity | null;

export type CreateMultipleActivitiesProps = {
    activitiesData: Partial<Omit<Activity, "id" | "created_at">>[];
};
export type CreateMultipleActivitiesResult = Activity[] | null;

export type DeleteActivityByIdProps = {
    id: string;
};
export type DeleteActivityByIdResult = boolean;