import { ClassActivity } from "@/features/classroom-activities";

export function calculateGeneralPresence(
  studentEmail: string,
  activities: ClassActivity[]
): number {
  if (activities.length === 0) return 0;

  const attendedActivities = activities.filter((activity) => {
    return activity.participants_email?.includes(studentEmail) || false;
  }).length;

  return Math.round((attendedActivities / activities.length) * 100);
}
