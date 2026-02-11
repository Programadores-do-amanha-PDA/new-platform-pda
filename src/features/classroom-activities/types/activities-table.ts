import { Profile } from "@/features/users/profile/types/profile";
import { ClassActivity } from ".";

export interface ActivitiesTablePropsT {
  allVisibleUsers: Profile[];
  allAggregateInMetricUsers: Profile[];
  activities: ClassActivity[];
  classroomId: string;
}
