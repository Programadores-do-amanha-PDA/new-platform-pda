import { ClassroomConfigModulesT } from "@/types";

/**
 * Utility functions for ModulesList component
 */

/**
 * Handles module selection for editing
 * @param module - Module to select for editing
 * @param setCurrentModule - State setter function
 */
export const handleModuleEdit = (
  module: ClassroomConfigModulesT,
  setCurrentModule: (module: ClassroomConfigModulesT | null) => void
): void => {
  setCurrentModule(module);
};

/**
 * Handles clearing the current module selection
 * @param setCurrentModule - State setter function
 */
export const handleModuleClear = (
  setCurrentModule: (module: ClassroomConfigModulesT | null) => void
): void => {
  setCurrentModule(null);
};

/**
 * Checks if modules list is empty
 * @param modules - Array of modules
 * @returns Boolean indicating if modules list is empty
 */
export const isModulesListEmpty = (modules: ClassroomConfigModulesT[]): boolean => {
  return modules.length === 0;
};

/**
 * Gets modules count for accessibility announcements
 * @param modules - Array of modules
 * @returns String describing modules count
 */
export const getModulesCountDescription = (modules: ClassroomConfigModulesT[]): string => {
  const count = modules.length;
  if (count === 0) return "Nenhum módulo encontrado";
  if (count === 1) return "1 módulo encontrado";
  return `${count} módulos encontrados`;
};