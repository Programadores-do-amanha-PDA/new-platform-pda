import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { ClassActivity } from ".";

export interface ActivitiesTablePropsT {
  allVisibleUsers: Partial<AuthUserWithProfile>[];
  allAggregateInMetricUsers: Partial<AuthUserWithProfile>[];
  activities: ClassActivity[];
  classroomId: string;
}
