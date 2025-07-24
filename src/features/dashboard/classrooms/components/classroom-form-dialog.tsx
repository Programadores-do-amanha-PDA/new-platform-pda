"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useClassroomStore } from "@/stores/modules/classrooms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import ClassroomPeriodSelector from "./classroom-period-selector";
import ClassroomStatusSelector from "./classroom-status-selector";
import { ClassroomT } from "@/types/classrooms";

const classroomFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  period: z.enum(["morning", "afternoon", "evening"]).nullable(),
  status: z.enum(["created", "active", "finished"], {
    required_error: "Status é obrigatório",
  }),
});

type ClassroomFormData = z.infer<typeof classroomFormSchema>;

const ClassroomFormDialog = ({
  currentClassroom,
}: {
  currentClassroom?: ClassroomT;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { createClassroom, updateClassroom } = useClassroomStore();

  const form = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomFormSchema),
    defaultValues: {
      name: "",
      period: "afternoon",
      status: "active",
    },
  });

  const handleSetModalOpen = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setModalOpen(open);
  };

  useEffect(() => {
    if (currentClassroom) {
      form.reset({
        name: currentClassroom.name,
        period: currentClassroom.period,
        status: currentClassroom.status,
      });
    } else {
      form.reset({
        name: "",
        period: "afternoon",
        status: "active",
      });
    }
  }, [currentClassroom, form]);

  const handleSubmit = async (data: ClassroomFormData) => {
    setLoading(true);

    try {
      if (currentClassroom) {
        const updates = {} as Partial<ClassroomT>;
        if (data.name !== currentClassroom.name) updates.name = data.name;
        if (data.period !== currentClassroom.period)
          updates.period = data.period;
        if (data.status !== currentClassroom.status)
          updates.status = data.status;

        await updateClassroom(currentClassroom.id, updates);
        toast.success("Turma editada com sucesso!");
      } else {
        await createClassroom(data);
        toast.success("Turma criada com sucesso!");
      }

      handleSetModalOpen(false);
    } catch {
      toast.error(`Erro ao ${currentClassroom ? "editar" : "criar"} a turma!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger>
        <Button
          className="font-semibold"
          variant={currentClassroom ? "outline" : "default"}
        >
          {currentClassroom ? "Editar Turma" : "Adicionar Turma"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-max">
        <DialogHeader>
          <DialogTitle>
            {currentClassroom
              ? `Editar ${currentClassroom.name}`
              : "Adicionar Turma"}
          </DialogTitle>
          <DialogDescription>
            {currentClassroom
              ? `Edite as informações da ${currentClassroom.name}`
              : "Insira o nome (ou codinome), o período e o status da nova turma."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da turma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full flex justify-between items-start gap-4">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="font-semibold">Período</FormLabel>
                    <FormControl>
                      <ClassroomPeriodSelector
                        value={field.value}
                        handleOnchange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="font-semibold">
                      Status da turma
                    </FormLabel>
                    <FormControl>
                      <ClassroomStatusSelector
                        value={field.value}
                        handleOnchange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="w-full flex gap-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSetModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="font-semibold"
                disabled={loading}
              >
                {loading && <LoaderCircle className="size-5 animate-spin" />}
                {currentClassroom ? "Salvar alterações" : "Criar turma"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassroomFormDialog;
