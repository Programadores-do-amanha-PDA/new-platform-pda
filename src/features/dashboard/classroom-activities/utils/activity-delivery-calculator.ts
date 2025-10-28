import { AuthUserWithProfileT } from "@/types";
import { ClassroomActivityT } from "../types";

/**
 * Calculates the percentage of students who participated in an activity
 * @param activity - The classroom activity
 * @param students - Array of students in the classroom
 * @returns Percentage of students who participated (0-100)
 */
export function calculateActivityDelivery(
  activity: ClassroomActivityT,
  students: Partial<AuthUserWithProfileT>[]
): number {
  if (!students || students.length === 0) {
    return 0;
  }

  const totalStudents = students.length;
  const participantsEmails = activity.participants_email || [];

  // Count how many students participated
  const participatingStudents = students.filter(
    (student) => student.email && participantsEmails.includes(student.email)
  ).length;

  // Calculate percentage and round to nearest integer
  const percentage = (participatingStudents / totalStudents) * 100;
  return Math.round(percentage);
}
