import { z } from "zod";
import { toast } from "sonner";
import { getCurrentWeekRange } from "@/components/shared/date-interval/utils";

import { handleProjectError } from "../error-handling";
import {
  ProjectFormSchemaT,
  ClassroomProjectT,
  ClassroomProjectModuleT,
  ClassroomProjectTypeT,
} from "../../types";

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
    rule_id: z
      .string()
      .min(1, "Rubrica do projeto é obrigatória")
      .refine((val) => val !== "", "Selecione uma rubrica válida"),
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
    cut_off_grade: z
      .number()
      .min(0, "Nota de corte deve ser maior ou igual a 0")
      .max(10, "Nota de corte deve ser menor ou igual a 10"),
    recovery_schedule: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
      .optional()
      .refine(
        (data) => {
          // If recovery_schedule is provided, both from and to must be present
          if (!data) return true; // Optional field
          if (!data.from || !data.to) return false;
          return data.from <= data.to;
        },
        {
          message: "Período de recuperação deve ter datas válidas",
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

  const recoverySchedule = currentProject?.recovery_schedule
    ? convertScheduleDateToDateObjects(currentProject.recovery_schedule)
    : undefined;

  return {
    title: currentProject?.title || "",
    module: currentProject?.module || "",
    project_type: currentProject?.project_type || "",
    rule_id: currentProject?.rule_id || "",
    schedule_date: scheduleDate,
    cut_off_grade: currentProject?.cut_off_grade || 7,
    recovery_schedule: recoverySchedule,
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

    const recoverySchedule = currentProject.recovery_schedule
      ? convertScheduleDateToDateObjects(currentProject.recovery_schedule)
      : undefined;

    return {
      title: currentProject.title,
      module: currentProject.module,
      project_type: currentProject.project_type,
      rule_id: currentProject.rule_id,
      schedule_date: scheduleDate,
      cut_off_grade: currentProject.cut_off_grade,
      recovery_schedule: recoverySchedule,
    };
  }

  return {
    title: "",
    module: "",
    project_type: "",
    rule_id: "",
    schedule_date: getCurrentWeekRange(),
    cut_off_grade: 7,
    recovery_schedule: undefined,
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

  // Transform recovery_schedule to match expected type
  let recovery_schedule: ClassroomProjectT["recovery_schedule"] = undefined;

  if (formData.recovery_schedule?.from) {
    recovery_schedule = {
      from: formData.recovery_schedule.from,
      to: formData.recovery_schedule.to,
    };
  }

  return {
    classroom_id: classroomId,
    title: formData.title,
    module: formData.module as ClassroomProjectModuleT,
    project_type: formData.project_type as ClassroomProjectTypeT,
    rule_id: formData.rule_id,
    schedule_date,
    cut_off_grade: formData.cut_off_grade,
    recovery_schedule,
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

  // Compare recovery schedule dates
  const formRecoveryFromTime = formData.recovery_schedule?.from?.getTime();
  const formRecoveryToTime = formData.recovery_schedule?.to?.getTime();

  const currentRecoverySchedule = convertScheduleDateToDateObjects(
    currentProject.recovery_schedule
  );
  const currentRecoveryFromTime = currentRecoverySchedule?.from?.getTime();
  const currentRecoveryToTime = currentRecoverySchedule?.to?.getTime();

  return (
    formData.title !== currentProject.title ||
    formData.module !== currentProject.module ||
    formData.project_type !== currentProject.project_type ||
    formData.rule_id !== currentProject.rule_id ||
    formData.cut_off_grade !== currentProject.cut_off_grade ||
    formFromTime !== currentFromTime ||
    formToTime !== currentToTime ||
    formRecoveryFromTime !== currentRecoveryFromTime ||
    formRecoveryToTime !== currentRecoveryToTime
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

  if (formData.rule_id !== currentProject.rule_id) {
    updates.rule_id = formData.rule_id;
  }

  if (formData.cut_off_grade !== currentProject.cut_off_grade) {
    updates.cut_off_grade = formData.cut_off_grade;
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

  // Compare recovery schedule dates
  const formRecoveryFromTime = formData.recovery_schedule?.from?.getTime();
  const formRecoveryToTime = formData.recovery_schedule?.to?.getTime();

  const currentRecoverySchedule = convertScheduleDateToDateObjects(
    currentProject.recovery_schedule
  );
  const currentRecoveryFromTime = currentRecoverySchedule?.from?.getTime();
  const currentRecoveryToTime = currentRecoverySchedule?.to?.getTime();

  if (formRecoveryFromTime !== currentRecoveryFromTime || formRecoveryToTime !== currentRecoveryToTime) {
    // Transform recovery_schedule to match expected type
    if (formData.recovery_schedule?.from) {
      updates.recovery_schedule = {
        from: formData.recovery_schedule.from,
        to: formData.recovery_schedule.to,
      };
    } else {
      updates.recovery_schedule = undefined;
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
