"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClassroomConfigJustificationT } from "@/types/classroom-configs";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import ColorPickerDropdown from "@/components/shared/color-picker-dropdown";
import Color, { ColorLike } from "color";
import { Checkbox } from "@/components/ui/checkbox";

const JustificationFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  key: z.string().min(1, "Identificador é obrigatório"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido"),
  isPresence: z.boolean(),
});

type JustificationFormData = z.infer<typeof JustificationFormSchema>;

interface JustificationFormDialogProps {
  configId: string;
  currentJustification?: ClassroomConfigJustificationT | null;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const JustificationFormDialog = ({
  configId,
  currentJustification,
  trigger,
  onClose,
}: JustificationFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEditing = !!currentJustification;

  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  const form = useForm<JustificationFormData>({
    resolver: zodResolver(JustificationFormSchema),
    defaultValues: {
      title: "",
      key: "",
      color: "#d67636",
      isPresence: false,
    },
  });

  useEffect(() => {
    if (currentJustification) {
      setOpen(true);
      form.reset({
        title: currentJustification.title,
        key: currentJustification.key,
        color: currentJustification.color,
        isPresence: currentJustification.is_presence,
      });
    }
  }, [currentJustification, form]);

  const handleClose = () => {
    setOpen(false);
    form.reset();
    onClose?.();
  };

  const handleColorChange = useCallback(
    (colorValue: ColorLike) => {
      try {
        // Handle different color formats that might come from ColorPicker
        let hex: string;

        if (Array.isArray(colorValue)) {
          // If it's an RGBA array
          const [r, g, b, a] = colorValue;
          const color = Color.rgb(r, g, b, a || 1);
          hex = color.hex();
        } else if (typeof colorValue === "string") {
          // If it's already a string (hex, rgb, etc.)
          hex = Color(colorValue).hex();
        } else if (colorValue && typeof colorValue === "object") {
          // If it's an object with color properties
          hex = Color(colorValue).hex();
        } else {
          return; // Invalid color format
        }

        // Update the form field
        form.setValue("color", hex);
      } catch (error) {
        console.error("Error processing color:", error);
      }
    },
    [form]
  );

  const onSubmit = async (data: JustificationFormData) => {
    setLoading(true);

    try {
      const currentConfig = Object.values(configsByClassroom).find(
        (config) => config.id === configId
      );

      if (!currentConfig) {
        toast.error("Configuração não encontrada!");
        setLoading(false);
        return;
      }

      const newJustification: ClassroomConfigJustificationT = {
        id: currentJustification?.id || crypto.randomUUID(),
        title: data.title.trim(),
        key: data.key.trim(),
        color: data.color,
        created_at:
          currentJustification?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_presence: data.isPresence,
      };

      // Get current justifications array
      const currentJustifications = currentConfig.justifications || [];

      let updatedJustifications: ClassroomConfigJustificationT[];

      if (isEditing && currentJustification) {
        // Update existing justification
        updatedJustifications = currentJustifications.map((justification) =>
          justification.id === currentJustification.id
            ? newJustification
            : justification
        );
      } else {
        // Add new justification
        updatedJustifications = [...currentJustifications, newJustification];
      }

      const success = await updateConfigById(configId, {
        justifications: updatedJustifications,
      });

      if (success) {
        handleClose();
        toast.success(
          isEditing
            ? "Justificativa atualizada com sucesso!"
            : "Justificativa criada com sucesso!"
        );
      } else {
        toast.error("Erro ao salvar justificativa!");
      }
    } catch (error) {
      console.error("Error saving justification:", error);
      toast.error("Erro ao salvar justificativa!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Justificativa" : "Nova Justificativa"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Justificativa de Falta"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Identificador
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: JF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Cor</FormLabel>
                    <FormControl>
                      <ColorPickerDropdown
                        color={field.value}
                        onColorChange={handleColorChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPresence"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Deve contabilizar presença?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marque se esta justificativa deve ser contabilizada como
                      presença
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Salvando..."
                  : isEditing
                  ? "Salvar Alterações"
                  : "Criar Justificativa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JustificationFormDialog;
