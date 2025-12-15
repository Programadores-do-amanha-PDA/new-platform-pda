import { Activity } from ".";

export interface ActivityStoreState {
    activities: Activity[];
    isFetchActivitiesLoading: boolean;
    isGetActivityByIdLoading: boolean;
    isCreateActivityLoading: boolean;
    isCreateMultipleActivitiesLoading: boolean;
    isUpdateActivityLoading: boolean;
    isDeleteActivityLoading: boolean;
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

type SetActivitiesProps = { activities: Activity[] };

type FetchAllActivitiesByClassroomProps = {
    classroomId: string;
};

type GetActivityByIdProps = {
    id: string;
};
type GetActivityByIdResult = {
    activity: Activity | null;
};

type CreateActivityProps = { activityData: Partial<Omit<Activity, "id" | "created_at">> };

type CreateMultipleActivitiesProps = {
    activitiesData: Partial<Omit<Activity, "id" | "created_at">>[];
};

type UpdateActivityProps = {
    id: string;
    updates: Partial<Omit<Activity, "id" | "created_at">>;
};

type DeleteActivityByIdProps = {
    id: string;
};
