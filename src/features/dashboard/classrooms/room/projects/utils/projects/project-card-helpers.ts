import { DateRange } from "react-day-picker";
import { ClassroomProject } from "../../types/projects/project";

/**
 * Checks if the project schedule has been modified
 * @param project - The original project data
 * @param scheduleDate - The current schedule date state
 * @returns True if the schedule has been modified
 */
export const hasScheduleChanged = (
  project: ClassroomProject,
  scheduleDate: DateRange | undefined
): boolean => {
  const originalFromTime = project.schedule_date?.from 
    ? new Date(project.schedule_date.from).getTime() 
    : null;
  const originalToTime = project.schedule_date?.to 
    ? new Date(project.schedule_date.to).getTime() 
    : null;
  
  const currentFromTime = scheduleDate?.from?.getTime() || null;
  const currentToTime = scheduleDate?.to?.getTime() || null;

  // Check if dates have changed
  if (originalFromTime !== currentFromTime || originalToTime !== currentToTime) {
    return true;
  }

  // Check if one is undefined and the other is not
  if ((project.schedule_date === undefined) !== (scheduleDate === undefined)) {
    return true;
  }

  return false;
};

/**
 * Converts project schedule date to DateRange format
 * @param project - The project with schedule data
 * @returns DateRange object or undefined
 */
export const convertProjectScheduleToDateRange = (
  project: ClassroomProject
): DateRange | undefined => {
  if (!project.schedule_date?.from || !project.schedule_date?.to) {
    return undefined;
  }

  return {
    from: new Date(project.schedule_date.from),
    to: new Date(project.schedule_date.to),
  };
};

/**
 * Generates the project link href based on context
 * @param currentPath - The current pathname
 * @param projectId - The project ID
 * @param expansive - Whether the card is in expansive mode
 * @returns The appropriate href for the project link
 */
export const generateProjectHref = (
  currentPath: string,
  projectId: string,
  expansive: boolean
): string => {
  return expansive
    ? `${currentPath}/${projectId}`
    : `${currentPath}/projects/${projectId}`;
};