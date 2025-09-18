"use client";

// Global imports
import { useState } from "react";
import { Info, LoaderCircle, Pen, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateRange } from "react-day-picker";

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
import DateIntervalPicker from "@/components/shared/date-interval/date-interval-picker";
import ProjectModuleSelect from "./project-module-select";
import ProjectTypeSelect from "./project-type-select";
import { useProjectStore } from "../stores";
import {
  ProjectDialogPropsT,
  ClassroomProjectModuleT,
  ClassroomProjectTypeT,
} from "../types";
import {
  createProjectSchema,
  ProjectFormSchemaT,
  getDefaultFormValues,
  getResetFormValues,
  handleProjectSubmission,
} from "../utils";

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
  });

  const { createProject, updateProject } = useProjectStore();

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
    } catch {
      // Error is already handled in handleProjectSubmission
      // Just need to ensure loading state is reset
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog modal={true} open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="font-semibold">
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
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full h-full flex flex-col gap-6 pt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Título</FormLabel>
                  <FormControl>
                    <Input placeholder="A teoria das cordas..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="columns-2 items-start">
              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Módulo</FormLabel>
                    <FormControl>
                      <ProjectModuleSelect
                        classroomId={classroom_id}
                        value={field.value as ClassroomProjectModuleT | ""}
                        onValueChange={(value: string) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Tipo do projeto
                    </FormLabel>
                    <FormControl>
                      <ProjectTypeSelect
                        value={field.value as ClassroomProjectTypeT | ""}
                        onValueChange={(value: string) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="columns-2 items-start">
              <FormField
                control={form.control}
                name="schedule_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Período de entregas
                    </FormLabel>
                    <FormControl>
                      <DateIntervalPicker
                        date={field.value as DateRange | undefined}
                        setDate={field.onChange}
                        buttonClassName="max-w-max"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closing_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-2">
                      Hora de fechamento
                      <div
                        title="Se não especificado, será definido automaticamente para 23:59"
                        className="cursor-help"
                      >
                        <Info className="size-4 fill-primary" />
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input type="time" defaultValue="23:59" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
