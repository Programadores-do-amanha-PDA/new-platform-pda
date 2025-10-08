"use client";

// Global imports
import { useState } from "react";
import { LoaderCircle, Pen, Plus, AlertCircle } from "lucide-react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

// Local imports
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DateTimeRangePicker } from "@/components/shared/date-time-range-picker";
import ProjectModuleSelect from "./project-module-select";
import ProjectTypeSelect from "./project-type-select";
import ProjectRuleSelector from "./project-rule-selector";
import { useProjectStore } from "../../stores";
import {
  ProjectDialogPropsT,
  ClassroomProjectModuleT,
  ClassroomProjectTypeT,
  ProjectFormSchemaT,
} from "../../types";
import {
  createProjectSchema,
  getDefaultFormValues,
  getResetFormValues,
  handleProjectSubmission,
} from "../../utils";

/**
 * ProjectDialog component for creating and editing classroom projects
 * Handles both create and edit modes with proper form validation and error handling
 */
const ProjectDialog = ({
  classroom_id,
  currentProject,
}: ProjectDialogPropsT): JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<ProjectFormSchemaT>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: getDefaultFormValues(currentProject),
    mode: "onChange", // Enable real-time validation
  });

  const { createProject, updateProject } = useProjectStore();

  // Watch for form errors to provide better UX
  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;

  /**
   * Handles dialog open/close state changes and form reset
   * @param isOpen - Whether the dialog should be open
   */
  const handleOpenChange = (isOpen: boolean): void => {
    const resetValues = getResetFormValues(currentProject, isOpen);
    form.reset(resetValues);
    setIsDialogOpen(isOpen);
  };

  /**
   * Handles form submission for both create and edit modes
   * @param formData - The validated form data
   */
  const handleSubmit = async (formData: ProjectFormSchemaT): Promise<void> => {
    setLoading(true);

    try {
      await handleProjectSubmission(
        formData,
        classroom_id,
        currentProject,
        createProject,
        updateProject
      );
      handleOpenChange(false);
    } catch (error) {
      // Error is already handled in handleProjectSubmission with toast
      // Additional client-side validation errors can be handled here
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form validation errors
   * @param errors - Form validation errors from react-hook-form
   */
  const handleFormError = (errors: FieldErrors<ProjectFormSchemaT>): void => {
    console.error("Form validation errors:", errors);

    // Display a general validation error toast if there are multiple errors
    const errorCount = Object.keys(errors).length;
    if (errorCount > 1) {
      toast.error(`Por favor, corrija os ${errorCount} erros no formulário.`);
    } else if (errorCount === 1) {
      toast.error("Por favor, corrija o erro no formulário.");
    }
  };

  return (
    <Dialog modal={true} open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={currentProject?.id ? "outline" : "default"}
          className="font-semibold"
        >
          {currentProject?.id ? (
            <>
              <Pen className="mr-2 h-4 w-4" />
              Editar projeto
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Criar projeto
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-max overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {currentProject?.id ? "Editar projeto" : "Criar projeto"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, handleFormError)}
            className="w-full h-full flex flex-col gap-6 pt-4"
          >
            {/* Error Summary */}
            {hasErrors && <FormMessage />}
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Título
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A teoria das cordas..."
                      className={
                        fieldState.error
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="columns-2 items-start">
              <FormField
                control={form.control}
                name="module"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Módulo
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <ProjectModuleSelect
                        classroomId={classroom_id}
                        value={field.value as ClassroomProjectModuleT | ""}
                        onValueChange={(value: string) => field.onChange(value)}
                        error={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_type"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Tipo do projeto
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <ProjectTypeSelect
                        value={field.value as ClassroomProjectTypeT | ""}
                        onValueChange={(value: ClassroomProjectTypeT) => field.onChange(value)}
                        error={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Rubrica do projeto
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <ProjectRuleSelector
                      handleSetRuleId={(ruleId: string) =>
                        field.onChange(ruleId)
                      }
                      currentProjectRulesId={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schedule_date"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Período de entregas
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <DateTimeRangePicker
                      value={field.value as DateRange | undefined}
                      onChange={field.onChange}
                      label=""
                      className={fieldState.error ? "border-destructive" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="font-semibold text-muted-foreground"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="font-semibold"
                disabled={loading}
              >
                {loading && (
                  <LoaderCircle className="size-5 animate-spin mr-2" />
                )}
                {hasErrors && !loading && (
                  <AlertCircle className="size-4 mr-2" />
                )}
                {currentProject?.id ? "Editar projeto" : "Criar projeto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
