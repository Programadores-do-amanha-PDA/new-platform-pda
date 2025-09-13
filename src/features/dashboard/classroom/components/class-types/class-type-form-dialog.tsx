"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ClassroomConfigClassTypesLimitT,
  ClassroomConfigClassTypesT,
  ClassroomConfigClassTypesSchema,
  ClassroomConfigClassTypesFormData,
} from "@/types/classroom-configs";
import Color, { ColorLike } from "color";
import ColorPickerDropdown from "@/components/ui/color-picker-dropdown";
import { toast } from "sonner";
import { ZodError, ZodIssue } from "zod";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";

interface ClassTypeFormDialogProps {
  currentClassType?: ClassroomConfigClassTypesT | null;
  configId: string;
  onClose?: () => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const ClassTypeFormDialog = ({
  currentClassType,
  configId,
  onClose,
  onSuccess,
  trigger,
}: ClassTypeFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [limits, setLimits] = useState<ClassroomConfigClassTypesLimitT[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  const isEditing = !!currentClassType;

  useEffect(() => {
    if (currentClassType) {
      setTitle(currentClassType.title);
      setLimits(
        currentClassType.limits?.map((limit) => ({
          id: limit.id,
          title: limit.title,
          key: limit.key,
          color: limit.color,
          min: limit.min,
          max: limit.max,
        })) || []
      );
      setOpen(true);
    }
  }, [currentClassType]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTitle("");
      setLimits([]);
      setErrors({});
      setIsSubmitting(false);
      setOpen(false);
      onClose?.();
    }
    if (open && !currentClassType) {
      setTitle("");
      setLimits([
        {
          id: crypto.randomUUID(),
          title: "Presença",
          key: "P",
          color: "#21a041",
          min: 60,
          max: undefined,
        },
        {
          id: crypto.randomUUID(),
          title: "Presença Parcial",
          key: "PP",
          color: "#e0de62",
          min: 30,
          max: 60,
        },
        {
          id: crypto.randomUUID(),
          title: "Falta",
          key: "F",
          color: "#e94040",
          min: 0,
          max: 30,
        },
      ]);
      setErrors({});
      setIsSubmitting(false);
      setOpen(true);
    }
  };

  const addLimit = () => {
    const randomColor = Color.hsl(
      Math.floor(Math.random() * 360),
      100,
      50
    ).hex();

    setLimits([
      ...limits,
      {
        id: crypto.randomUUID(),
        title: "",
        key: "",
        color: randomColor,
        min: 0,
        max: undefined,
      },
    ]);
  };

  const removeLimit = (index: number) => {
    setLimits(limits.filter((_, i) => i !== index));
  };

  const updateLimit = (
    index: number,
    field: keyof ClassroomConfigClassTypesLimitT,
    value: string | number | undefined
  ) => {
    setLimits(
      limits.map((limit, i) =>
        i === index ? { ...limit, [field]: value } : limit
      )
    );
  };

  const handleColorChange = useCallback(
    (index: number, colorValue: ColorLike) => {
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

        // Only update if the color actually changed to prevent infinite loops
        setLimits((prevLimits) => {
          const currentColor = prevLimits[index]?.color;
          if (currentColor === hex) {
            return prevLimits; // No change, return same reference
          }

          return prevLimits.map((limit, i) =>
            i === index ? { ...limit, color: hex } : limit
          );
        });
      } catch (error) {
        console.error("Error processing color:", error);
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data with Zod
      const formData: ClassroomConfigClassTypesFormData = {
        title,
        limits: limits.map((limit) => ({
          ...limit,
          max: limit.max === 0 ? undefined : limit.max,
        })),
      };

      const validatedData = ClassroomConfigClassTypesSchema.parse(formData);

      // Get current classroom config
      const currentConfig = Object.values(configsByClassroom).find(
        (config) => config.id === configId
      );
      if (!currentConfig) {
        toast.error("Configuração não encontrada!");
        return;
      }

      // Update class types in the config
      const updatedClassTypes = [...(currentConfig.class_types || [])];

      if (isEditing && currentClassType) {
        // Update existing class type
        const index = updatedClassTypes.findIndex(
          (ct) => ct.id === currentClassType.id
        );
        if (index !== -1) {
          updatedClassTypes[index] = {
            ...currentClassType,
            title: validatedData.title,
            limits: validatedData.limits,
            updated_at: new Date().toISOString(),
          };
        }
      } else {
        const newClassType: ClassroomConfigClassTypesT = {
          id: crypto.randomUUID(),
          title: validatedData.title,
          limits: validatedData.limits,
          created_at: new Date().toISOString(),
        };
        updatedClassTypes.push(newClassType);
      }

      // Update the classroom config
      const result = await updateConfigById(currentConfig.id, {
        class_types: updatedClassTypes,
      });

      if (result) {
        toast.success(
          isEditing
            ? "Tipo de aula atualizado com sucesso!"
            : "Tipo de aula criado com sucesso!"
        );
        onSuccess?.();
        handleOpenChange(false);
      } else {
        toast.error("Erro ao salvar tipo de aula");
      }
    } catch (error) {
      if (error instanceof Error) {
        // Handle Zod validation errors
        if (error.name === "ZodError") {
          const zodError = error as ZodError;
          const fieldErrors: Record<string, string> = {};

          zodError.errors?.forEach((err: ZodIssue) => {
            const path = err.path.join(".");
            fieldErrors[path] = err.message;
          });

          setErrors(fieldErrors);
          toast.error("Por favor, corrija os erros no formulário");
        } else {
          toast.error("Erro ao salvar tipo de aula");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tipo de Aula" : "Novo Tipo de Aula"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do tipo de aula"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Limites por intervalo</Label>
              <Button type="button" onClick={addLimit} size="sm">
                <Plus className="size-4 mr-2" />
                Adicionar Limite
              </Button>
            </div>

            {limits.map((limit, index) => (
              <article key={index} className="border rounded-lg space-y-4">
                <div className="flex items-center justify-between border-b p-2">
                  <div className="space-y-2 flex-1 mr-2">
                    <Label htmlFor={`limit-title-${index}`} className="sr-only">
                      Título do Limite
                    </Label>
                    <Input
                      id={`limit-title-${index}`}
                      value={limit.title}
                      onChange={(e) =>
                        updateLimit(index, "title", e.target.value)
                      }
                      placeholder="Ex: Presença Parcial"
                      className={
                        errors[`limits.${index}.title`]
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors[`limits.${index}.title`] && (
                      <p className="text-sm text-destructive">
                        {errors[`limits.${index}.title`]}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLimit(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-4">
                  <div className="space-y-2">
                    <Label>Identificador</Label>
                    <Input
                      value={limit.key}
                      onChange={(e) =>
                        updateLimit(index, "key", e.target.value)
                      }
                      placeholder="Ex: PP"
                      className={
                        errors[`limits.${index}.key`]
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors[`limits.${index}.key`] && (
                      <p className="text-sm text-destructive">
                        {errors[`limits.${index}.key`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <ColorPickerDropdown
                      color={limit.color}
                      onColorChange={(colorValue) =>
                        handleColorChange(index, colorValue)
                      }
                    />
                    {errors[`limits.${index}.color`] && (
                      <p className="text-sm text-destructive">
                        {errors[`limits.${index}.color`]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mx-4 mb-4">
                  <div className="space-y-2">
                    <Label>Mínimo de minutos</Label>
                    <Input
                      type="number"
                      value={limit.min}
                      onChange={(e) =>
                        updateLimit(index, "min", parseInt(e.target.value) || 0)
                      }
                      min="0"
                      className={
                        errors[`limits.${index}.min`]
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors[`limits.${index}.min`] && (
                      <p className="text-sm text-destructive">
                        {errors[`limits.${index}.min`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Máximo de minutos (opcional)</Label>
                    <Input
                      type="number"
                      value={limit.max || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateLimit(
                          index,
                          "max",
                          value === "" ? undefined : parseInt(value) || 0
                        );
                      }}
                      min="0"
                      placeholder="Deixe vazio para ilimitado"
                      className={
                        errors[`limits.${index}.max`]
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors[`limits.${index}.max`] && (
                      <p className="text-sm text-destructive">
                        {errors[`limits.${index}.max`]}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEditing
                ? "Salvar Alterações"
                : "Criar Tipo de Aula"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassTypeFormDialog;
