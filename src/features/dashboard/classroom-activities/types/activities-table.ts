import { AuthUserWithProfileT } from "@/types";
import { ClassroomActivityT } from "../types";

export interface ActivitiesTablePropsT {
  allVisibleUsers: Partial<AuthUserWithProfileT>[];
  allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
  activities: ClassroomActivityT[];
  classroomId: string;
}
