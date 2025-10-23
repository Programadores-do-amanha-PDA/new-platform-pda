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
import { Eye, EyeOff, Percent, Slash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/admin/sidebar-config";
import pathLabels from "@/utils/path-labels";

const UserModeFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  key: z.string().min(1, "Identificador é obrigatório"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido"),
  featuresRules: z.array(
    z.object({
      id: z.string().min(1, "ID é obrigatório"),
      isVisible: z.boolean(),
      aggregateInMetric: z.boolean(),
    })
  ),
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
      featuresRules: ADMIN_CLASSROOM_PAGES_KEYS.map((feature) => ({
        id: feature,
        isVisible: true,
        aggregateInMetric: true,
      })),
    },
  });

  useEffect(() => {
    if (currentUserMode) {
      setOpen(true);

      // Merge existing rules with available features to ensure all features are present
      const mergedFeaturesRules = ADMIN_CLASSROOM_PAGES_KEYS?.map((feature) => {
        const existingRule = currentUserMode?.featuresRules?.find(
          (rule) => rule.id === feature
        );
        return (
          existingRule || {
            id: feature,
            isVisible: true,
            aggregateInMetric: true,
          }
        );
      });

      form.reset({
        title: currentUserMode.title,
        key: currentUserMode.key,
        color: currentUserMode.color,
        featuresRules: mergedFeaturesRules,
      });
    }
  }, [currentUserMode, form]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setOpen(true);
    } else if (!open) {
      setOpen(false);
      onClose?.();
      form.reset();
    }
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
      const currentConfig = Object.values(configsByClassroom)?.find(
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
        featuresRules: data.featuresRules.map((rule) => ({
          id: rule.id,
          isVisible: rule.isVisible,
          aggregateInMetric: rule.aggregateInMetric,
        })),
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
        handleOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

            <div className="w-full h-max overflow-hidden border rounded-md">
              <Table className="w-full h-max p-0! border-0!">
                <TableHeader className="p-0! border-0!">
                  <TableRow className="p-0! border-0!">
                    <TableHead className="p-0! border-0!">
                      <p className="w-full h-10 flex justify-start items-center text-sm font-bold border-b-2 border-r px-2">
                        Funcionalidade
                      </p>
                    </TableHead>
                    <TableHead className="w-[100px] text-center p-0! border-0!">
                      <p className="w-full h-10 flex justify-center items-center text-sm font-bold border-b-2 border-r px-2">
                        Visibilidade
                      </p>
                    </TableHead>
                    <TableHead className="w-[100px] text-center p-0! border-0!">
                      <p className="w-full h-10 flex justify-center items-center text-sm font-bold border-b-2 px-2">
                        Métricas
                      </p>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ADMIN_CLASSROOM_PAGES_KEYS.map((feature, index) => {
                    const isLastItem =
                      index === ADMIN_CLASSROOM_PAGES_KEYS.length - 1;

                    return (
                      <TableRow key={feature} className="p-0! border-0!">
                        <TableCell className="p-0! border-0!">
                          <p
                            className={cn(
                              "w-full h-8 flex justify-start items-center text-sm border-r px-2",
                              !isLastItem && "border-b"
                            )}
                          >
                            {pathLabels[feature]}
                          </p>
                        </TableCell>

                        <TableCell className="p-0! border-0!">
                          <FormField
                            control={form.control}
                            name={`featuresRules.${index}.isVisible`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    id={`${feature}-is-visible`}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="hidden"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`${feature}-is-visible`}
                                  className={cn(
                                    "cursor-pointer w-full h-8 flex justify-center items-center text-sm border-r px-2",
                                    !isLastItem && "border-b"
                                  )}
                                >
                                  {field.value ? (
                                    <Eye className="size-5 text-green-600" />
                                  ) : (
                                    <EyeOff className="size-5 text-gray-400" />
                                  )}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="p-0! border-0!">
                          <FormField
                            control={form.control}
                            name={`featuresRules.${index}.aggregateInMetric`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    id={`${feature}-aggregate-in-metric`}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="hidden"
                                  />
                                </FormControl>

                                <FormLabel
                                  htmlFor={`${feature}-aggregate-in-metric`}
                                  className={cn(
                                    "cursor-pointer w-full h-8 flex justify-center items-center text-sm px-2",
                                    !isLastItem && "border-b"
                                  )}
                                >
                                  {field.value ? (
                                    <Percent className="size-5 text-blue-600" />
                                  ) : (
                                    <Slash className="size-5 text-gray-400" />
                                  )}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
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
