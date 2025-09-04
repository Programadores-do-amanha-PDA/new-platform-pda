"use client";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import ProjectModuleSelect from "./project-module-select";
import {
  ClassroomProjectModuleT,
  ClassroomProjectT,
  ClassroomProjectTypeT,
} from "@/types/classroom-projects/project";
import ProjectTypeSelect from "./project-type-select";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import DateIntervalPicker from "@/components/shared/date-interval/date-interval-picker";

const CreateProjectDialog = ({
  classroom_id,
  currentProject,
}: {
  classroom_id: string;
  currentProject?: ClassroomProjectT;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [module, setModule] = useState<ClassroomProjectModuleT | "">("");
  const [type, setType] = useState<ClassroomProjectTypeT | "">("");
  const [scheduleDate, setScheduleDate] = useState<DateRange | undefined>();

  const { createProject, updateProject } = useProjectStore();

  const onOpenChange = (e: boolean) => {
    if (e && currentProject) {
      setTitle(currentProject.title);
      setModule(currentProject.module);
      setType(currentProject.project_type);
      setScheduleDate(currentProject.schedule_date);
    } else if (!e || (e && !currentProject)) {
      setTitle("");
      setModule("");
      setType("");
      setScheduleDate(undefined);
    }
    setIsDialogOpen(e);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !classroom_id ||
        title.length < 3 ||
        !module ||
        !type ||
        !scheduleDate?.from ||
        !scheduleDate?.to
      ) {
        throw new Error("required fields are missing");
      }

      if (!currentProject?.id) {
        await createProject({
          title,
          module,
          classroom_id,
          project_type: type,
          schedule_date: scheduleDate,
        });
        return;
      } else if (
        currentProject.id &&
        (title !== currentProject.title ||
          module !== currentProject.module ||
          type !== currentProject.project_type ||
          scheduleDate.from !== currentProject?.schedule_date?.from ||
          scheduleDate.to !== currentProject?.schedule_date?.to)
      ) {
        const updates = {} as Partial<ClassroomProjectT>;
        if (title !== currentProject.title) updates.title = title;
        if (module !== currentProject.module) updates.module = module;
        if (type !== currentProject.project_type) updates.project_type = type;
        if (
          scheduleDate.from !== currentProject?.schedule_date?.from ||
          scheduleDate.to !== currentProject?.schedule_date?.to
        ) {
          updates.schedule_date = scheduleDate;
        }
        await updateProject(currentProject.id, updates);
        return;
      }
    } catch (error) {
      console.log(error)
      toast.error(
        currentProject?.id
          ? "Erro ao editar projeto. Tente novamente mais tarde!"
          : "Erro ao criar projeto. Tente novamente mais tarde!"
      );
      return;
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog modal={true} open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="font-semibold">
          {currentProject?.id ? "Editar projeto" : "Criar projeto"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentProject?.id ? "Editar projeto" : "Criar projeto"}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-6 pt-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 items-start">
            <Label htmlFor="title" className="font-semibold">
              Titulo
            </Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A teoria das cordas..."
            />
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex flex-col gap-2 items-start">
              <Label htmlFor="module" className="font-semibold">
                Módulo
              </Label>
              <ProjectModuleSelect
                id="module"
                name="module"
                value={module}
                onValueChange={setModule}
              />
            </div>
            <div className="flex flex-col gap-2 items-start">
              <Label htmlFor="type" className="font-semibold">
                Tipo do projeto
              </Label>
              <ProjectTypeSelect
                id="type"
                name="type"
                value={type}
                onValueChange={setType}
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-2 items-start">
            <Label htmlFor="module" className="font-semibold">
              Período de entregas
            </Label>
            <DateIntervalPicker date={scheduleDate} setDate={setScheduleDate} />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose>
              <Button
                type="button"
                variant="outline"
                className="font-semibold text-muted-foreground"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="font-semibold" disabled={loading}>
              {loading && <LoaderCircle className="size-5 animate-spin" />}
              {currentProject?.id ? "Editar projeto" : "Criar projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
