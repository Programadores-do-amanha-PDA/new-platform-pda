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
    title: z
      .string()
      .min(1, "Título é obrigatório")
      .min(3, "Título deve ter pelo menos 3 caracteres")
      .max(100, "Título deve ter no máximo 100 caracteres")
      .trim(),
    module: z
      .string()
      .min(1, "Módulo é obrigatório")
      .refine((val) => val !== "", "Selecione um módulo válido"),
    project_type: z
      .string()
      .min(1, "Tipo do projeto é obrigatório")
      .refine((val) => val !== "", "Selecione um tipo de projeto válido"),
    schedule_date: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
      .refine(
        (data) => {
          // Both from and to must be present
          if (!data.from || !data.to) return false;
          return data.from <= data.to;
        },
        {
          message: "Período de entregas é obrigatório com datas válidas",
        }
      ),
  })
  .refine(
    (data) => {
      // Additional validation for schedule_date
      if (!data.schedule_date?.from || !data.schedule_date?.to) {
        return false;
      }

      // Check if the date range is reasonable (not more than 1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      return data.schedule_date.to <= oneYearFromNow;
    },
    {
      message: "O período de entregas não pode ser superior a 1 ano",
      path: ["schedule_date"],
    }
  );

export type ProjectFormSchemaT = z.infer<typeof createProjectSchema>;

/**
 * Converts string dates to Date objects for schedule_date
 * @param scheduleDate - The schedule date that might have string dates
 * @returns Schedule date with proper Date objects
 */
const convertScheduleDateToDateObjects = (
  scheduleDate?: ClassroomProjectT["schedule_date"]
): { from?: Date; to?: Date } | undefined => {
  if (!scheduleDate) return undefined;

  const result: { from?: Date; to?: Date } = {};

  if (scheduleDate.from) {
    result.from =
      scheduleDate.from instanceof Date
        ? scheduleDate.from
        : new Date(scheduleDate.from);
  }

  if (scheduleDate.to) {
    result.to =
      scheduleDate.to instanceof Date
        ? scheduleDate.to
        : new Date(scheduleDate.to);
  }

  return result;
};

/**
 * Gets default form values for project creation/editing
 * @param currentProject - The current project being edited (optional)
 * @returns Default form values
 */
export const getDefaultFormValues = (
  currentProject?: ClassroomProjectT
): ProjectFormSchemaT => {
  // Ensure schedule_date has the correct type structure
  const defaultScheduleDate = getCurrentWeekRange();
  const scheduleDate = currentProject?.schedule_date
    ? convertScheduleDateToDateObjects(currentProject.schedule_date) ||
      defaultScheduleDate
    : defaultScheduleDate;

  return {
    title: currentProject?.title || "",
    module: currentProject?.module || "",
    project_type: currentProject?.project_type || "",
    schedule_date: scheduleDate,
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
    const scheduleDate = currentProject.schedule_date
      ? convertScheduleDateToDateObjects(currentProject.schedule_date) ||
        getCurrentWeekRange()
      : getCurrentWeekRange();

    return {
      title: currentProject.title,
      module: currentProject.module,
      project_type: currentProject.project_type,
      schedule_date: scheduleDate,
    };
  }

  return {
    title: "",
    module: "",
    project_type: "",
    schedule_date: getCurrentWeekRange(),
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
  // Compare dates safely - convert current project dates to Date objects first
  const formFromTime = formData.schedule_date?.from?.getTime();
  const formToTime = formData.schedule_date?.to?.getTime();

  const currentScheduleDate = convertScheduleDateToDateObjects(
    currentProject.schedule_date
  );
  const currentFromTime = currentScheduleDate?.from?.getTime();
  const currentToTime = currentScheduleDate?.to?.getTime();

  return (
    formData.title !== currentProject.title ||
    formData.module !== currentProject.module ||
    formData.project_type !== currentProject.project_type ||
    formFromTime !== currentFromTime ||
    formToTime !== currentToTime
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

  // Compare dates safely using timestamps - convert current project dates first
  const formFromTime = formData.schedule_date?.from?.getTime();
  const formToTime = formData.schedule_date?.to?.getTime();

  const currentScheduleDate = convertScheduleDateToDateObjects(
    currentProject.schedule_date
  );
  const currentFromTime = currentScheduleDate?.from?.getTime();
  const currentToTime = currentScheduleDate?.to?.getTime();

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

  return updates;
};

/**
 * Validates that the schedule date has both from and to dates
 * @param scheduleDate - The date range to validate
 * @returns True if valid, false otherwise
 */
export const validateScheduleDate = (scheduleDate?: {
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

    // Additional validation that's not covered by Zod
    if (!formData.schedule_date?.from || !formData.schedule_date?.to) {
      throw new Error("Período de entregas é obrigatório");
    }

    if (!currentProject?.id) {
      // Create new project
      const projectData = transformFormDataToProject(formData, classroomId);
      const success = await createProject(projectData);
      if (success) {
        toast.success("Projeto criado com sucesso!");
      } else {
        throw new Error(
          "Falha ao criar projeto. Verifique os dados e tente novamente."
        );
      }
    } else {
      // Update existing project
      if (hasProjectChanges(formData, currentProject)) {
        const updates = createProjectUpdates(formData, currentProject);
        const success = await updateProject(currentProject.id, updates);
        if (success) {
          toast.success("Projeto atualizado com sucesso!");
        } else {
          throw new Error(
            "Falha ao atualizar projeto. Verifique os dados e tente novamente."
          );
        }
      } else {
        toast.info("Nenhuma alteração foi detectada.");
      }
    }
  } catch (error) {
    handleProjectError(error, "project-dialog-submission");

    // More specific error messages
    let errorMessage = "Erro inesperado. Tente novamente mais tarde!";

    if (error instanceof Error) {
      if (error.message.includes("Falha ao")) {
        errorMessage = error.message;
      } else if (error.message.includes("obrigatório")) {
        errorMessage = error.message;
      } else {
        errorMessage = currentProject?.id
          ? "Erro ao editar projeto. Verifique os dados e tente novamente!"
          : "Erro ao criar projeto. Verifique os dados e tente novamente!";
      }
    }

    toast.error(errorMessage);
    throw error; // Re-throw to allow component to handle loading state
  }
};
