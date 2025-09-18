import { z } from "zod";
import { toast } from "sonner";
import {
  ClassroomProjectT,
  ClassroomProjectModuleT,
  ClassroomProjectTypeT,
} from "../types/project";
import { getCurrentWeekRange } from "@/components/shared/date-interval/utils";
import { handleProjectError } from "./error-handling";

/**
 * Zod schema for project form validation
 */
export const createProjectSchema = z
  .object({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
    module: z.string().min(1, "Módulo é obrigatório"),
    project_type: z.string().min(1, "Tipo do projeto é obrigatório"),
    schedule_date: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
      .optional(),
    closing_time: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.schedule_date) return true;
      if (!data.schedule_date.from) return true;
      if (!data.schedule_date.to) return true;
      return data.schedule_date.from <= data.schedule_date.to;
    },
    {
      message: "A data de início deve ser anterior à data de término",
      path: ["schedule_date"],
    }
  );

export type ProjectFormSchemaT = z.infer<typeof createProjectSchema>;

/**
 * Gets default form values for project creation/editing
 * @param currentProject - The current project being edited (optional)
 * @returns Default form values
 */
export const getDefaultFormValues = (
  currentProject?: ClassroomProjectT
): ProjectFormSchemaT => {
  return {
    title: currentProject?.title || "",
    module: currentProject?.module || "",
    project_type: currentProject?.project_type || "",
    schedule_date: currentProject?.schedule_date || getCurrentWeekRange(),
    closing_time: currentProject?.closing_time || "",
  };
};

/**
 * Resets form values based on current project state
 * @param currentProject - The current project being edited (optional)
 * @param isOpen - Whether the dialog is open
 * @returns Form values to reset to
 */
export const getResetFormValues = (
  currentProject?: ClassroomProjectT,
  isOpen?: boolean
): ProjectFormSchemaT => {
  if (isOpen && currentProject) {
    return {
      title: currentProject.title,
      module: currentProject.module,
      project_type: currentProject.project_type,
      schedule_date: currentProject.schedule_date,
      closing_time: currentProject.closing_time || "",
    };
  }

  return {
    title: "",
    module: "",
    project_type: "",
    schedule_date: getCurrentWeekRange(),
    closing_time: "",
  };
};

/**
 * Transforms form data into project data for API submission
 * @param formData - The form data to transform
 * @param classroomId - The classroom ID
 * @returns Transformed project data
 */
export const transformFormDataToProject = (
  formData: ProjectFormSchemaT,
  classroomId: string
): Omit<ClassroomProjectT, "id" | "created_at"> => {
  // Transform schedule_date to match expected type
  let schedule_date: ClassroomProjectT["schedule_date"] = undefined;

  if (formData.schedule_date?.from) {
    schedule_date = {
      from: formData.schedule_date.from,
      to: formData.schedule_date.to,
    };
  }

  return {
    title: formData.title,
    module: formData.module as ClassroomProjectModuleT,
    classroom_id: classroomId,
    project_type: formData.project_type as ClassroomProjectTypeT,
    schedule_date,
    closing_time: formData.closing_time || "23:59",
  };
};

/**
 * Checks if there are changes between form data and current project
 * @param formData - The form data to compare
 * @param currentProject - The current project to compare against
 * @returns True if there are changes, false otherwise
 */
export const hasProjectChanges = (
  formData: ProjectFormSchemaT,
  currentProject: ClassroomProjectT
): boolean => {
  // Compare dates safely
  const formFromTime = formData.schedule_date?.from?.getTime();
  const formToTime = formData.schedule_date?.to?.getTime();
  const currentFromTime = currentProject?.schedule_date?.from?.getTime();
  const currentToTime = currentProject?.schedule_date?.to?.getTime();

  return (
    formData.title !== currentProject.title ||
    formData.module !== currentProject.module ||
    formData.project_type !== currentProject.project_type ||
    formFromTime !== currentFromTime ||
    formToTime !== currentToTime ||
    (formData.closing_time || "23:59") !==
      (currentProject.closing_time || "23:59")
  );
};

/**
 * Creates update object with only changed fields
 * @param formData - The form data with new values
 * @param currentProject - The current project with existing values
 * @returns Partial project object with only changed fields
 */
export const createProjectUpdates = (
  formData: ProjectFormSchemaT,
  currentProject: ClassroomProjectT
): Partial<ClassroomProjectT> => {
  const updates: Partial<ClassroomProjectT> = {};

  if (formData.title !== currentProject.title) {
    updates.title = formData.title;
  }

  if (formData.module !== currentProject.module) {
    updates.module = formData.module as ClassroomProjectModuleT;
  }

  if (formData.project_type !== currentProject.project_type) {
    updates.project_type = formData.project_type as ClassroomProjectTypeT;
  }

  // Compare dates safely using timestamps
  const formFromTime = formData.schedule_date?.from?.getTime();
  const formToTime = formData.schedule_date?.to?.getTime();
  const currentFromTime = currentProject?.schedule_date?.from?.getTime();
  const currentToTime = currentProject?.schedule_date?.to?.getTime();

  if (formFromTime !== currentFromTime || formToTime !== currentToTime) {
    // Transform schedule_date to match expected type
    if (formData.schedule_date?.from) {
      updates.schedule_date = {
        from: formData.schedule_date.from,
        to: formData.schedule_date.to,
      };
    } else {
      updates.schedule_date = undefined;
    }
  }

  if (
    (formData.closing_time || "23:59") !==
    (currentProject.closing_time || "23:59")
  ) {
    updates.closing_time = formData.closing_time || "23:59";
  }

  return updates;
};

/**
 * Validates that the schedule date has both from and to dates
 * @param scheduleDate - The date range to validate
 * @returns True if valid, false otherwise
 */
const validateScheduleDate = (scheduleDate?: {
  from?: Date;
  to?: Date;
}): boolean => {
  return !!(scheduleDate?.from && scheduleDate?.to);
};

/**
 * Handles project submission with proper error handling and user feedback
 * @param formData - The form data to submit
 * @param classroomId - The classroom ID
 * @param currentProject - The current project (for edit mode)
 * @param createProject - Function to create a new project
 * @param updateProject - Function to update an existing project
 * @returns Promise that resolves when submission is complete
 */
export const handleProjectSubmission = async (
  formData: ProjectFormSchemaT,
  classroomId: string,
  currentProject: ClassroomProjectT | undefined,
  createProject: (
    data: Omit<ClassroomProjectT, "id" | "created_at">
  ) => Promise<boolean>,
  updateProject: (
    id: string,
    updates: Partial<ClassroomProjectT>
  ) => Promise<boolean>
): Promise<void> => {
  try {
    if (!classroomId) {
      throw new Error("ID da sala de aula é obrigatório");
    }

    // Validate schedule date
    if (!validateScheduleDate(formData.schedule_date)) {
      throw new Error("Período de entregas é obrigatório");
    }

    if (!currentProject?.id) {
      // Create new project
      const projectData = transformFormDataToProject(formData, classroomId);
      const success = await createProject(projectData);
      if (success) {
        toast.success("Projeto criado com sucesso!");
      } else {
        throw new Error("Failed to create project");
      }
    } else {
      // Update existing project
      if (hasProjectChanges(formData, currentProject)) {
        const updates = createProjectUpdates(formData, currentProject);
        const success = await updateProject(currentProject.id, updates);
        if (success) {
          toast.success("Projeto atualizado com sucesso!");
        } else {
          throw new Error("Failed to update project");
        }
      }
    }
  } catch (error) {
    handleProjectError(error, "project-dialog-submission");
    const contextualMessage = currentProject?.id
      ? "Erro ao editar projeto. Tente novamente mais tarde!"
      : "Erro ao criar projeto. Tente novamente mais tarde!";

    toast.error(contextualMessage);
    throw error; // Re-throw to allow component to handle loading state
  }
};
