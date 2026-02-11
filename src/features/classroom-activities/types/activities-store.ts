import { ClassActivity } from ".";

export interface ActivityStoreState {
    activities: ClassActivity[];
    loading: boolean;
}

export interface ActivityActions {
    setActivities: ({ activities }: SetActivitiesProps) => void;
    fetchAllActivitiesByClassroom: ({ classroomId }: FetchAllActivitiesByClassroomProps) => Promise<boolean>;
    getActivityById: ({ id }: GetActivityByIdProps) => Promise<GetActivityByIdResult>;
    createActivity: ({ activityData }: CreateActivityProps) => Promise<boolean>;
    createMultipleActivities: ({ activitiesData }: CreateMultipleActivitiesProps) => Promise<boolean>;
    updateActivityById: ({ id, updates }: UpdateActivityProps) => Promise<boolean>;
    deleteActivityById: ({ id }: DeleteActivityByIdProps) => Promise<boolean>;
    reset: () => void;
}

type SetActivitiesProps = { activities: ClassActivity[] };

type FetchAllActivitiesByClassroomProps = {
    classroomId: string;
};

type GetActivityByIdProps = {
    id: string;
};
type GetActivityByIdResult = {
    activity: ClassActivity | null;
};

type CreateActivityProps = { activityData: Partial<Omit<ClassActivity, "id" | "created_at">> };

type CreateMultipleActivitiesProps = {
    activitiesData: Partial<Omit<ClassActivity, "id" | "created_at">>[];
};

type UpdateActivityProps = {
    id: string;
    updates: Partial<Omit<ClassActivity, "id" | "created_at">>;
};

type DeleteActivityByIdProps = {
    id: string;
};
