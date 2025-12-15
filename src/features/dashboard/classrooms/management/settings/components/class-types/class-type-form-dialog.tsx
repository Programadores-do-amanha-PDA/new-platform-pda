"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Color, { ColorLike } from "color";
import { toast } from "sonner";
import { Info, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ColorPickerDropdown from "@/components/shared/color-picker-dropdown";

import { useSettingStore } from "../../store";
import { ClassTypes, ClassTypesFormData } from "../../types";
import { ClassTypesSchema } from "../../utils";

interface ClassTypeFormDialogProps {
    currentClassType?: ClassTypes | null;
    configId: string;
    onClose?: () => void;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export const ClassTypeFormDialog = ({ currentClassType, configId, onClose, onSuccess, trigger }: ClassTypeFormDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { updateSettingById, settingsByClassroom } = useSettingStore();

    const isEditing = !!currentClassType;

    const form = useForm<ClassTypesFormData>({
        resolver: zodResolver(ClassTypesSchema),
        defaultValues: {
            title: "",
            presenceCalcType: "bySingleMeeting",
            limits: [
                {
                    id: crypto.randomUUID(),
                    title: "Presença",
                    key: "P",
                    color: "#21a041",
                    min: 60,
                    max: undefined,
                    allowJustification: false,
                },
                {
                    id: crypto.randomUUID(),
                    title: "Presença Parcial",
                    key: "PP",
                    color: "#e0de62",
                    min: 30,
                    max: 60,
                    allowJustification: true,
                },
                {
                    id: crypto.randomUUID(),
                    title: "Falta",
                    key: "F",
                    color: "#e94040",
                    min: 0,
                    max: 30,
                    allowJustification: true,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "limits",
    });

    useEffect(() => {
        if (currentClassType) {
            setOpen(true);
            form.reset({
                title: currentClassType.title,
                presenceCalcType: currentClassType.presence_calc_type,
                limits:
                    currentClassType.limits?.map((limit) => ({
                        id: limit.id,
                        title: limit.title,
                        key: limit.key,
                        color: limit.color,
                        min: limit.min,
                        max: limit.max,
                        allowJustification: limit.allow_justification,
                        isPresence: limit.is_presence,
                    })) || [],
            });
        }
    }, [currentClassType, form]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            form.reset();
            setIsSubmitting(false);
            setOpen(false);
            onClose?.();
        } else {
            setOpen(true);
            if (!currentClassType) {
                form.reset({
                    title: "",
                    presenceCalcType: "bySingleMeeting",
                    limits: [
                        {
                            id: crypto.randomUUID(),
                            title: "Presença",
                            key: "P",
                            color: "#21a041",
                            min: 60,
                            max: undefined,
                            allowJustification: false,
                        },
                        {
                            id: crypto.randomUUID(),
                            title: "Presença Parcial",
                            key: "PP",
                            color: "#e0de62",
                            min: 30,
                            max: 60,
                            allowJustification: true,
                        },
                        {
                            id: crypto.randomUUID(),
                            title: "Falta",
                            key: "F",
                            color: "#e94040",
                            min: 0,
                            max: 30,
                            allowJustification: true,
                        },
                    ],
                });
            }
        }
    };

    const addLimit = () => {
        const randomColor = Color.hsl(Math.floor(Math.random() * 360), 100, 50).hex();

        append({
            id: crypto.randomUUID(),
            title: "",
            key: "",
            color: randomColor,
            min: 0,
            max: undefined,
            allowJustification: false,
            isPresence: true,
        });
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

                // Update the form field
                form.setValue(`limits.${index}.color`, hex);
            } catch (error) {
                console.error("Error processing color:", error);
            }
        },
        [form],
    );

    const onSubmit = async (data: ClassTypesFormData) => {
        setIsSubmitting(true);

        try {
            // Get current classroom config
            const currentConfig = Object.values(settingsByClassroom).find((config) => config.id === configId);
            if (!currentConfig) {
                toast.error("Configuração não encontrada!");
                return;
            }

            // Update class types in the config
            const updatedClassTypes = [...(currentConfig.class_types || [])];

            if (isEditing && currentClassType) {
                // Update existing class type
                const index = updatedClassTypes.findIndex((ct) => ct.id === currentClassType.id);
                if (index !== -1) {
                    updatedClassTypes[index] = {
                        ...currentClassType,
                        title: data.title,
                        presence_calc_type: data.presenceCalcType,
                        limits: data.limits.map((limit) => ({
                            ...limit,
                            is_presence: limit.isPresence,
                            allow_justification: limit.allowJustification,
                            max: limit.max === 0 ? undefined : limit.max,
                        })),
                        updated_at: new Date().toISOString(),
                    };
                }
            } else {
                const newClassType: ClassTypes = {
                    id: crypto.randomUUID(),
                    title: data.title,
                    presence_calc_type: data.presenceCalcType,
                    limits: data.limits.map((limit) => ({
                        is_presence: limit.isPresence,
                        allow_justification: limit.allowJustification,
                        ...limit,
                        max: limit.max === 0 ? undefined : limit.max,
                    })),
                    created_at: new Date().toISOString(),
                };
                updatedClassTypes.push(newClassType);
            }

            const result = await updateSettingById({
                id: currentConfig.id,
                updates: {
                    class_types: updatedClassTypes,
                },
            });

            if (result) {
                toast.success(isEditing ? "Tipo de aula atualizado com sucesso!" : "Tipo de aula criado com sucesso!");
                onSuccess?.();
                handleOpenChange(false);
            } else {
                toast.error("Erro ao salvar tipo de aula");
            }
        } catch (error) {
            console.error("Error saving class type:", error);
            toast.error("Erro ao salvar tipo de aula");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="flex flex-col w-full max-w-2xl h-full max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Tipo de Aula" : "Novo Tipo de Aula"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full h-full overflow-hidden">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o título do tipo de aula" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="presenceCalcType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="font-semibold">Tipo de cálculo de presença</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="bySingleMeeting" id="presenceCalcType-single" />
                                                <Label
                                                    htmlFor="presenceCalcType-single"
                                                    className="font-normal text-sm cursor-pointer"
                                                >
                                                    Por encontro individual
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="byWeeklyMeetings" id="presenceCalcType-weekly" />
                                                <Label
                                                    htmlFor="presenceCalcType-weekly"
                                                    className="font-normal text-sm cursor-pointer"
                                                >
                                                    Por encontros semanais
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col bg-muted rounded-lg w-full h-full overflow-hidden">
                            <div className="flex justify-between items-center p-4">
                                <Label className="font-semibold">Limites por intervalo</Label>
                                <Button type="button" onClick={addLimit} size="sm">
                                    <Plus className="mr-2 size-4" />
                                    Adicionar Limite
                                </Button>
                            </div>

                            <ul className="flex flex-col gap-4 p-4 w-full h-max overflow-y-auto">
                                {fields.map((field, index) => (
                                    <li key={field.id} className="space-y-4 bg-background border rounded-lg">
                                        <div className="flex justify-between items-center p-2 border-b">
                                            <div className="flex-1 space-y-2 mr-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`limits.${index}.id`}
                                                    render={({ field }) => <input type="hidden" {...field} />}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`limits.${index}.title`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="sr-only font-semibold">
                                                                Título do Limite
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: Presença Parcial" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>

                                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mx-4">
                                            <FormField
                                                control={form.control}
                                                name={`limits.${index}.key`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Identificador</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: PP" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`limits.${index}.color`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Cor</FormLabel>
                                                        <FormControl>
                                                            <ColorPickerDropdown
                                                                color={field.value || "#000000"}
                                                                onColorChange={(colorValue) =>
                                                                    handleColorChange(index, colorValue)
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="gap-4 grid grid-cols-2 mx-4 mb-4">
                                            <FormField
                                                control={form.control}
                                                name={`limits.${index}.min`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Mínimo de minutos</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`limits.${index}.max`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">
                                                            Máximo de minutos
                                                            <p title="Deixe vazio para ilimitado">
                                                                <Info className="fill-primary size-4 cursor-help" />
                                                                <span className="sr-only">Deixe vazio para ilimitado</span>
                                                            </p>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                placeholder="∞"
                                                                value={field.value || ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    field.onChange(
                                                                        value === "" ? undefined : parseInt(value) || 0,
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="gap-4 grid grid-cols-2 mx-4 mb-4">
                                            <FormField
                                                control={form.control}
                                                name={`limits.${index}.isPresence`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>Contar como presença?</FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`limits.${index}.allowJustification`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>Permitir justificativa?</FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Tipo de Aula"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
