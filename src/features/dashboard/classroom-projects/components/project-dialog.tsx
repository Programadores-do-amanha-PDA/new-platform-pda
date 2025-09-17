"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Info, LoaderCircle, Pen, Plus } from "lucide-react";
import { z } from "zod";
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
import ProjectModuleSelect from "./project-module-select";
import ProjectTypeSelect from "./project-type-select";
import {
  ClassroomProjectModuleT,
  ClassroomProjectT,
  ClassroomProjectTypeT,
} from "@/features/dashboard/classroom-projects/types/project";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import DateIntervalPicker from "@/components/shared/date-interval/date-interval-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCurrentWeekRange } from "@/components/shared/date-interval/utils";

const createProjectSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  module: z.string().min(1, "Módulo é obrigatório"),
  project_type: z.string().min(1, "Tipo do projeto é obrigatório"),
  schedule_date: z
    .object({
      from: z.date({ required_error: "Data de início é obrigatória" }),
      to: z.date({ required_error: "Data de fim é obrigatória" }),
    })
    .optional(),
  closing_time: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

const ProjectDialog = ({
  classroom_id,
  currentProject,
}: {
  classroom_id: string;
  currentProject?: ClassroomProjectT;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: currentProject?.title || "",
      module: currentProject?.module || "",
      project_type: currentProject?.project_type || "",
      schedule_date: currentProject?.schedule_date || getCurrentWeekRange(),
      closing_time: currentProject?.closing_time || "",
    },
  });

  const { createProject, updateProject } = useProjectStore();

  const onOpenChange = (e: boolean) => {
    if (e && currentProject) {
      form.reset({
        title: currentProject.title,
        module: currentProject.module,
        project_type: currentProject.project_type,
        schedule_date: currentProject.schedule_date,
        closing_time: currentProject.closing_time || "",
      });
    } else if (!e || (e && !currentProject)) {
      form.reset({
        title: "",
        module: "",
        project_type: "",
        schedule_date: getCurrentWeekRange(),
        closing_time: "",
      });
    }
    setIsDialogOpen(e);
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    setLoading(true);

    try {
      if (!classroom_id) {
        throw new Error("ID da sala de aula é obrigatório");
      }

      const projectData = {
        title: data.title,
        module: data.module as ClassroomProjectModuleT,
        classroom_id,
        project_type: data.project_type as ClassroomProjectTypeT,
        schedule_date: data.schedule_date,
        closing_time: data.closing_time || "23:59",
      };

      if (!currentProject?.id) {
        await createProject(projectData);
        toast.success("Projeto criado com sucesso!");
      } else {
        // Verificar se houve mudanças
        const hasChanges =
          data.title !== currentProject.title ||
          data.module !== currentProject.module ||
          data.project_type !== currentProject.project_type ||
          data.schedule_date?.from !== currentProject?.schedule_date?.from ||
          data.schedule_date?.to !== currentProject?.schedule_date?.to ||
          (data.closing_time || "23:59") !==
            (currentProject.closing_time || "23:59");

        if (hasChanges) {
          const updates = {} as Partial<ClassroomProjectT>;
          if (data.title !== currentProject.title) updates.title = data.title;
          if (data.module !== currentProject.module)
            updates.module = data.module as ClassroomProjectModuleT;
          if (data.project_type !== currentProject.project_type)
            updates.project_type = data.project_type as ClassroomProjectTypeT;
          if (
            data.schedule_date?.from !== currentProject?.schedule_date?.from ||
            data.schedule_date?.to !== currentProject?.schedule_date?.to
          ) {
            updates.schedule_date = data.schedule_date;
          }
          if (
            (data.closing_time || "23:59") !==
            (currentProject.closing_time || "23:59")
          ) {
            updates.closing_time = data.closing_time || "23:59";
          }

          await updateProject(currentProject.id, updates);
          toast.success("Projeto atualizado com sucesso!");
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(
        currentProject?.id
          ? "Erro ao editar projeto. Tente novamente mais tarde!"
          : "Erro ao criar projeto. Tente novamente mais tarde!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog modal={true} open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="font-semibold">
          {currentProject?.id ? (
            <>
              <Pen /> Editar projeto
            </>
          ) : (
               <>
              <Plus /> Criar projeto
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
            onSubmit={form.handleSubmit(onSubmit)}
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
                        onValueChange={(value) => field.onChange(value)}
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
                        onValueChange={(value) => field.onChange(value)}
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
                        date={field.value}
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
                    <FormLabel className="font-semibold">
                      Hora de fechamento
                      <div
                        title="Se não especificado, será definido automaticamente para
                      23:59"
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
                {loading && <LoaderCircle className="size-5 animate-spin" />}
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
