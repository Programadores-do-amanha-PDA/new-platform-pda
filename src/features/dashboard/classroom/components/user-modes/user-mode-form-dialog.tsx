"use client";

// Global imports
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ColorLike } from "color";
import { Eye, EyeOff, Percent, Slash } from "lucide-react";

// UI Components
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ColorPickerDropdown from "@/components/shared/color-picker-dropdown";

// Local imports
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import { cn } from "@/lib/utils";
import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/admin/sidebar-config";
import pathLabels from "@/utils/path-labels";
import {
  UserModeFormDialogPropsT,
} from "../../types";
import {
  UserModeFormSchema,
  UserModeFormSchemaT,
} from "../../utils/user-mode-validation";
import {
  processColorValue,
  getDefaultUserModeFormValues,
  createUserModeFromFormData,
  updateUserModesArray,
} from "../../utils/user-mode-form-utils";

/**
 * UserModeFormDialog component for creating and editing user modes
 * Follows clean architecture principles with separated concerns
 */
const UserModeFormDialog = ({
  configId,
  currentUserMode,
  trigger,
  onClose,
}: UserModeFormDialogPropsT): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const isEditing = !!currentUserMode;

  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  const form = useForm<UserModeFormSchemaT>({
    resolver: zodResolver(UserModeFormSchema),
    defaultValues: getDefaultUserModeFormValues(),
    mode: "onChange", // Enable real-time validation
  });

  useEffect(() => {
    if (currentUserMode) {
      setOpen(true);
      const formValues = getDefaultUserModeFormValues(currentUserMode);
      form.reset(formValues);
    }
  }, [currentUserMode, form]);

  /**
   * Handles dialog open/close state changes and form reset
   * @param isOpen - Whether the dialog should be open
   */
  const handleOpenChange = (isOpen: boolean): void => {
    if (isOpen) {
      setOpen(true);
    } else {
      setOpen(false);
      onClose?.();
      form.reset(getDefaultUserModeFormValues());
    }
  };

  /**
   * Handles color value changes with proper validation
   * @param colorValue - Color value from color picker
   */
  const handleColorChange = useCallback(
    (colorValue: ColorLike): void => {
      const processedColor = processColorValue(colorValue);
      if (processedColor) {
        form.setValue("color", processedColor);
      }
    },
    [form]
  );

  /**
   * Handles form submission for both create and edit modes
   * @param data - Validated form data
   */
  const onSubmit = async (data: UserModeFormSchemaT): Promise<void> => {
    setLoading(true);

    try {
      const currentConfig = Object.values(configsByClassroom)?.find(
        (config) => config.id === configId
      );

      if (!currentConfig) {
        toast.error("Configuração não encontrada!");
        return;
      }

      const newUserMode = createUserModeFromFormData(data, currentUserMode);
      const currentUserModes = currentConfig.user_modes || [];
      const updatedUserModes = updateUserModesArray(
        currentUserModes,
        newUserMode,
        isEditing
      );

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

            <div 
              className="w-full h-max overflow-hidden border rounded-md"
              role="region"
              aria-label="Configurações de funcionalidades do modo de usuário"
            >
              <Table className="w-full h-max p-0! border-0!">
                <TableHeader className="p-0! border-0!">
                  <TableRow className="p-0! border-0!">
                    <TableHead 
                      className="p-0! border-0!"
                      scope="col"
                    >
                      <div className="w-full h-10 flex justify-start items-center text-sm font-bold border-b-2 border-r px-2">
                        Funcionalidade
                      </div>
                    </TableHead>
                    <TableHead 
                      className="w-[100px] text-center p-0! border-0!"
                      scope="col"
                    >
                      <div className="w-full h-10 flex justify-center items-center text-sm font-bold border-b-2 border-r px-2">
                        Visibilidade
                      </div>
                    </TableHead>
                    <TableHead 
                      className="w-[100px] text-center p-0! border-0!"
                      scope="col"
                    >
                      <div className="w-full h-10 flex justify-center items-center text-sm font-bold border-b-2 px-2">
                        Métricas
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ADMIN_CLASSROOM_PAGES_KEYS.map((feature, index) => {
                    const isLastItem =
                      index === ADMIN_CLASSROOM_PAGES_KEYS.length - 1;

                    return (
                      <TableRow key={feature} className="p-0! border-0!">
                        <TableCell 
                          className="p-0! border-0!"
                          scope="row"
                        >
                          <div
                            className={cn(
                              "w-full h-8 flex justify-start items-center text-sm border-r px-2",
                              !isLastItem && "border-b"
                            )}
                          >
                            {pathLabels[feature]}
                          </div>
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
                                    aria-describedby={`${feature}-visibility-description`}
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`${feature}-is-visible`}
                                  className={cn(
                                    "cursor-pointer w-full h-8 flex justify-center items-center text-sm border-r px-2",
                                    !isLastItem && "border-b"
                                  )}
                                  aria-label={`${field.value ? 'Ocultar' : 'Mostrar'} ${pathLabels[feature]}`}
                                >
                                  {field.value ? (
                                    <Eye 
                                      className="size-5 text-green-600" 
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <EyeOff 
                                      className="size-5 text-gray-400" 
                                      aria-hidden="true"
                                    />
                                  )}
                                </FormLabel>
                                <div 
                                  id={`${feature}-visibility-description`} 
                                  className="sr-only"
                                >
                                  {field.value ? 'Funcionalidade visível' : 'Funcionalidade oculta'}
                                </div>
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
                                    aria-describedby={`${feature}-metric-description`}
                                  />
                                </FormControl>

                                <FormLabel
                                  htmlFor={`${feature}-aggregate-in-metric`}
                                  className={cn(
                                    "cursor-pointer w-full h-8 flex justify-center items-center text-sm px-2",
                                    !isLastItem && "border-b"
                                  )}
                                  aria-label={`${field.value ? 'Incluir' : 'Excluir'} ${pathLabels[feature]} das métricas`}
                                >
                                  {field.value ? (
                                    <Percent 
                                      className="size-5 text-blue-600" 
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <Slash 
                                      className="size-5 text-gray-400" 
                                      aria-hidden="true"
                                    />
                                  )}
                                </FormLabel>
                                <div 
                                  id={`${feature}-metric-description`} 
                                  className="sr-only"
                                >
                                  {field.value ? 'Incluído nas métricas' : 'Excluído das métricas'}
                                </div>
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
