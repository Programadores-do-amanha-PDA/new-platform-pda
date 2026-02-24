"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Color, { ColorLike } from "color";
import { toast } from "@/lib/toast";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ColorPickerDropdown from "@/components/shared/color-picker-dropdown";

import { useClassroomSettingStore } from "../../store";
import { SettingJustification } from "../../types";
import { JustificationFormData, JustificationFormSchema } from "../../utils/justification-form-schema";
import { logger } from "@/lib/logger";

interface JustificationFormDialogProps {
    configId: string;
    currentJustification?: SettingJustification | null;
    trigger?: React.ReactNode;
    onClose?: () => void;
}

const log = logger.child({ module: "JustificationFormDialog" });

export const JustificationFormDialog = ({ configId, currentJustification, trigger, onClose }: JustificationFormDialogProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isEditing = !!currentJustification;

    const { updateClassroomSettingById, settingsByClassroom } = useClassroomSettingStore();

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
        [form],
    );

    const onSubmit = async (data: JustificationFormData) => {
        setLoading(true);

        try {
            const currentConfig = Object.values(settingsByClassroom).find((config) => config.id === configId);

            if (!currentConfig) {
                toast.error({
                    title: "Erro ao salvar justificativa",
                    description: "A configuração não foi encontrada!",
                });
                setLoading(false);
                return;
            }

            const newJustification: SettingJustification = {
                id: currentJustification?.id || crypto.randomUUID(),
                title: data.title.trim(),
                key: data.key.trim(),
                color: data.color,
                created_at: currentJustification?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_presence: data.isPresence,
            };

            // Get current justifications array
            const currentJustifications = currentConfig.justifications || [];

            let updatedJustifications: SettingJustification[];

            if (isEditing && currentJustification) {
                // Update existing justification
                updatedJustifications = currentJustifications.map((justification) =>
                    justification.id === currentJustification.id ? newJustification : justification,
                );
            } else {
                // Add new justification
                updatedJustifications = [...currentJustifications, newJustification];
            }

            const success = await updateClassroomSettingById({
                id: configId,
                updates: {
                    justifications: updatedJustifications,
                },
            });

            if (success) {
                handleClose();
                toast.success({
                    title: isEditing ? "Justificativa atualizada" : "Justificativa criada",
                    description: isEditing ? "Justificativa atualizada com sucesso!" : "Justificativa criada com sucesso!",
                });
            } else {
                toast.error({
                    title: "Erro ao salvar justificativa",
                    description: "Ocorreu um erro ao salvar a justificativa!",
                });
            }
        } catch (error) {
            log.error({ err: error, operation: "saveJustification" }, "Error saving justification");
            toast.error({
                title: "Erro ao salvar justificativa",
                description: "Ocorreu um erro ao salvar a justificativa!",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Justificativa" : "Nova Justificativa"}</DialogTitle>
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
                                        <Input placeholder="Ex: Justificativa de Falta" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Identificador</FormLabel>
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
                                                color={field.value || "#000000"}
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
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Deve contabilizar como presença?</FormLabel>
                                        <p className="text-muted-foreground text-sm">
                                            Marque se esta justificativa deve ser contabilizada como presença
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
                                {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Justificativa"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
