import { ClassroomProjectT } from "../types/project";

/**
 * Creates a project end date time by combining date and closing time
 * @param dateString - The date string
 * @param closingTime - The closing time in HH:MM format
 * @returns The end date time as timestamp
 */
export const createProjectEndDateTime = (
  dateString: string,
  closingTime: string
): number => {
  const [hours, minutes] = closingTime.split(":").map(Number);
  const endDate = new Date(dateString);
  endDate.setHours(hours, minutes, 59, 999);
  return endDate.getTime();
};

/**
 * Checks if a project is currently active (within delivery period)
 * @param project - The project to check
 * @returns True if project is active, false otherwise
 */
export const isProjectActive = (project: ClassroomProjectT): boolean => {
  if (!project.schedule_date?.from || !project.schedule_date?.to) return false;

  const now = Date.now();
  const startTime = new Date(project.schedule_date.from).getTime();
  const endTime = createProjectEndDateTime(
    project.schedule_date.to.toString(),
    project.closing_time || "23:59"
  );

  return startTime <= now && endTime >= now;
};

/**
 * Checks if a project delivery period is in the future
 * @param project - The project to check
 * @returns True if project starts in the future, false otherwise
 */
export const isProjectFuture = (project: ClassroomProjectT): boolean => {
  if (!project.schedule_date?.from) return false;
  
  const now = Date.now();
  const startTime = new Date(project.schedule_date.from).getTime();
  
  return startTime > now;
};

/**
 * Checks if a project delivery period has ended
 * @param project - The project to check
 * @returns True if project has ended, false otherwise
 */
export const isProjectExpired = (project: ClassroomProjectT): boolean => {
  if (!project.schedule_date?.to) return false;
  
  const now = Date.now();
  const endTime = createProjectEndDateTime(
    project.schedule_date.to.toString(),
    project.closing_time || "23:59"
  );
  
  return endTime < now;
};

/**
 * Gets the project status based on current time and schedule
 * @param project - The project to check
 * @returns Project status string
 */
export const getProjectStatus = (project: ClassroomProjectT): 'active' | 'future' | 'expired' | 'no-schedule' => {
  if (!project.schedule_date?.from || !project.schedule_date?.to) {
    return 'no-schedule';
  }
  
  if (isProjectActive(project)) return 'active';
  if (isProjectFuture(project)) return 'future';
  if (isProjectExpired(project)) return 'expired';
  
  return 'no-schedule';
};