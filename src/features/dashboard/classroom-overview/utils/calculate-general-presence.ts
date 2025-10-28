import { ClassroomActivityT } from "../../classroom-activities/types";

export function calculateGeneralPresence(
  studentEmail: string,
  activities: ClassroomActivityT[]
): number {
  if (activities.length === 0) return 0;

  const attendedActivities = activities.filter((activity) => {
    return activity.participants_email?.includes(studentEmail) || false;
  }).length;

  return Math.round((attendedActivities / activities.length) * 100);
}
