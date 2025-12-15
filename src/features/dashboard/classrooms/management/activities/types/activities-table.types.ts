import { AuthUserWithProfileT } from "@/types";
import { Activity } from ".";

export interface ActivitiesTablePropsT {
  allVisibleUsers: Partial<AuthUserWithProfileT>[];
  allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
  activities: Activity[];
  classroomId: string;
}
