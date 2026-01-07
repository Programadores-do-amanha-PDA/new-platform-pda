import { ClassroomProject } from "../../types/projects/project";

/**
 * Checks if a project is currently active (within delivery period)
 * @param project - The project to check
 * @returns True if project is active, false otherwise
 */
export const isProjectActive = (project: ClassroomProject): boolean => {
  if (!project.schedule_date?.from || !project.schedule_date?.to) return false;

  const now = Date.now();
  const startTime = new Date(project.schedule_date.from).getTime();
  const endTime = new Date(project.schedule_date.to).getTime();

  return startTime <= now && endTime >= now;
};

/**
 * Checks if a project delivery period is in the future
 * @param project - The project to check
 * @returns True if project starts in the future, false otherwise
 */
export const isProjectFuture = (project: ClassroomProject): boolean => {
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
export const isProjectExpired = (project: ClassroomProject): boolean => {
  if (!project.schedule_date?.to) return false;
  
  const now = Date.now();
  const endTime = new Date(project.schedule_date.to).getTime();
  
  return endTime < now;
};

/**
 * Gets the project status based on current time and schedule
 * @param project - The project to check
 * @returns Project status string
 */
export const getProjectStatus = (project: ClassroomProject): 'active' | 'future' | 'expired' | 'no-schedule' => {
  if (!project.schedule_date?.from || !project.schedule_date?.to) {
    return 'no-schedule';
  }
  
  if (isProjectActive(project)) return 'active';
  if (isProjectFuture(project)) return 'future';
  if (isProjectExpired(project)) return 'expired';
  
  return 'no-schedule';
};