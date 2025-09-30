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
import { ClassroomConfigUserMode } from "@/types/classroom-configs";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import ColorPickerDropdown from "@/components/shared/color-picker-dropdown";
import Color, { ColorLike } from "color";
import { Checkbox } from "@/components/ui/checkbox";

const UserModeFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  key: z.string().min(1, "Identificador é obrigatório"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido"),
  mustBePresent: z.boolean(),
});

type UserModeFormData = z.infer<typeof UserModeFormSchema>;

interface UserModeFormDialogProps {
  configId: string;
  currentUserMode?: ClassroomConfigUserMode | null;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const UserModeFormDialog = ({
  configId,
  currentUserMode,
  trigger,
  onClose,
}: UserModeFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEditing = !!currentUserMode;

  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  const form = useForm<UserModeFormData>({
    resolver: zodResolver(UserModeFormSchema),
    defaultValues: {
      title: "",
      key: "",
      color: "#3bf6a8",
      mustBePresent: true,
    },
  });

  useEffect(() => {
    if (currentUserMode) {
      setOpen(true);
      form.reset({
        title: currentUserMode.title,
        key: currentUserMode.key,
        color: currentUserMode.color,
        mustBePresent: currentUserMode.must_be_present,
      });
    }
  }, [currentUserMode, form]);

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

  const onSubmit = async (data: UserModeFormData) => {
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

      const newUserMode: ClassroomConfigUserMode = {
        id: currentUserMode?.id || crypto.randomUUID(),
        title: data.title.trim(),
        key: data.key.trim(),
        color: data.color,
        must_be_present: data.mustBePresent,
        created_at: currentUserMode?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Get current userModes array
      const currentUserModes = currentConfig.user_modes || [];

      let updatedUserModes: ClassroomConfigUserMode[];

      if (isEditing && currentUserMode) {
        // Update existing user mode
        updatedUserModes = currentUserModes.map((userMode) =>
          userMode.id === currentUserMode.id ? newUserMode : userMode
        );
      } else {
        // Add new user mode
        updatedUserModes = [...currentUserModes, newUserMode];
      }

      const success = await updateConfigById(configId, {
        user_modes: updatedUserModes,
      });

      if (success) {
        handleClose();
        toast.success(
          isEditing
            ? "Modo de usuário atualizado com sucesso!"
            : "Modo de usuário criado com sucesso!"
        );
      } else {
        toast.error("Erro ao salvar modo de usuário!");
      }
    } catch (error) {
      console.error("Error saving user mode:", error);
      toast.error("Erro ao salvar modo de usuário!");
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
            {isEditing ? "Editar Modo de Usuário" : "Novo Modo de Usuário"}
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
                    <Input placeholder="Ex: Síncrono" {...field} />
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
                      <Input placeholder="Ex: S" {...field} />
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
              name="mustBePresent"
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
                      Marque se este modo de usuário deve fazer parte da
                      contagem de presença
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
                  : "Criar Modo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModeFormDialog;
