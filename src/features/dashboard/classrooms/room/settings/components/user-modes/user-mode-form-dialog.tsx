"use client";

import { useState, useEffect, useCallback, type JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ColorLike } from "color";
import { Eye, EyeOff, Percent, Slash } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColorPickerDropdown from "@/components/shared/color-picker-dropdown";

import { cn } from "@/lib/utils";
import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/stack-provider/roles/admin/sidebar-config";
import pathLabels from "@/utils/path-labels";

import { useClassroomSettingStore } from "../../store";

import { UserModeFormDialogProps } from "../../types";
import {
    getDefaultUserModeFormValues,
    processColorValue,
    createUserModeFromFormData,
    updateUserModesArray,
    getAllFeaturesRules,
    UserModeFormSchemaT,
    UserModeFormSchema,
} from "../../utils";

/**
 * UserModeFormDialog component for creating and editing user modes
 * Follows clean architecture principles with separated concerns
 */
export const UserModeFormDialog = ({ configId, currentUserMode, trigger, onClose }: UserModeFormDialogProps): JSX.Element => {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const isEditing = !!currentUserMode;
    const allFeatureRules = getAllFeaturesRules(currentUserMode || null, false);

    const { updateSettingById, settingsByClassroom } = useClassroomSettingStore();

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
        [form],
    );

    /**
     * Handles form submission for both create and edit modes
     * @param data - Validated form data
     */
    const onSubmit = async (data: UserModeFormSchemaT): Promise<void> => {
        setLoading(true);

        try {
            const currentConfig = Object.values(settingsByClassroom)?.find((config) => config.id === configId);

            if (!currentConfig) {
                toast.error("Configuração não encontrada!");
                return;
            }

            const newUserMode = createUserModeFromFormData(data, currentUserMode);
            const currentUserModes = currentConfig.user_modes || [];
            const updatedUserModes = updateUserModesArray(currentUserModes, newUserMode, isEditing);

            const success = await updateSettingById({
                id: configId,
                updates: {
                    user_modes: updatedUserModes,
                },
            });

            if (success) {
                handleOpenChange(false);
                toast.success(isEditing ? "Modo de usuário atualizado com sucesso!" : "Modo de usuário criado com sucesso!");
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
                    <DialogTitle>{isEditing ? "Editar Modo de Usuário" : "Novo Modo de Usuário"}</DialogTitle>
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

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Identificador</FormLabel>
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
                                                color={field.value || "#000000"}
                                                onColorChange={handleColorChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div
                            className="border rounded-md w-full h-max overflow-hidden"
                            role="region"
                            aria-label="Configurações de funcionalidades do modo de usuário"
                        >
                            <Table className="p-0! border-0! w-full h-max">
                                <TableHeader className="p-0! border-0!">
                                    <TableRow className="p-0! border-0!">
                                        <TableHead className="p-0! border-0!" scope="col">
                                            <div className="flex justify-start items-center px-2 border-r border-b-2 w-full h-10 font-bold text-sm">
                                                Funcionalidade
                                            </div>
                                        </TableHead>
                                        <TableHead className="p-0! border-0! w-[100px] text-center" scope="col">
                                            <div className="flex justify-center items-center px-2 border-r border-b-2 w-full h-10 font-bold text-sm">
                                                Visibilidade
                                            </div>
                                        </TableHead>
                                        <TableHead className="p-0! border-0! w-[100px] text-center" scope="col">
                                            <div className="flex justify-center items-center px-2 border-b-2 w-full h-10 font-bold text-sm">
                                                Métricas
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allFeatureRules.map((feature, index) => {
                                        const isLastItem = index === ADMIN_CLASSROOM_PAGES_KEYS.length - 1;

                                        return (
                                            <TableRow key={`feature-rule-${feature.id}`} className="p-0! border-0!">
                                                <TableCell className="p-0! border-0!" scope="row">
                                                    <div
                                                        className={cn(
                                                            "flex justify-start items-center px-2 border-r w-full h-8 text-sm",
                                                            !isLastItem && "border-b",
                                                        )}
                                                    >
                                                        {pathLabels[feature.id]}
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
                                                                        id={`${feature.id}-is-visible`}
                                                                        checked={
                                                                            typeof feature.isVisible !== "undefined"
                                                                                ? field.value
                                                                                : false
                                                                        }
                                                                        onCheckedChange={field.onChange}
                                                                        className="hidden"
                                                                        aria-describedby={`${feature.id}-visibility-description`}
                                                                    />
                                                                </FormControl>

                                                                <FormLabel
                                                                    htmlFor={
                                                                        typeof feature.isVisible === "undefined"
                                                                            ? undefined
                                                                            : `${feature.id}-is-visible`
                                                                    }
                                                                    className={cn(
                                                                        "flex justify-center items-center px-2 border-r w-full h-8 text-sm cursor-pointer",
                                                                        !isLastItem && "border-b",
                                                                        typeof feature.isVisible === "undefined" && "bg-muted!",
                                                                    )}
                                                                    aria-label={`${
                                                                        field.value && typeof feature.isVisible !== "undefined"
                                                                            ? "Ocultar"
                                                                            : "Mostrar"
                                                                    } ${pathLabels[feature.id]}`}
                                                                >
                                                                    {field.value && typeof feature.isVisible !== "undefined" ? (
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
                                                                    id={`${feature.id}-visibility-description`}
                                                                    className="sr-only"
                                                                >
                                                                    {field.value
                                                                        ? "Funcionalidade visível"
                                                                        : "Funcionalidade oculta"}
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
                                                                        id={`${feature.id}-aggregate-in-metric`}
                                                                        checked={
                                                                            typeof feature.aggregateInMetric !== "undefined"
                                                                                ? field.value
                                                                                : false
                                                                        }
                                                                        onCheckedChange={field.onChange}
                                                                        className="hidden"
                                                                        aria-describedby={`${feature.id}-metric-description`}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel
                                                                    htmlFor={
                                                                        typeof feature.aggregateInMetric === "undefined"
                                                                            ? undefined
                                                                            : `${feature.id}-aggregate-in-metric`
                                                                    }
                                                                    className={cn(
                                                                        "flex justify-center items-center px-2 w-full h-8 text-sm cursor-pointer",
                                                                        !isLastItem && "border-b",
                                                                        typeof feature.aggregateInMetric === "undefined" &&
                                                                            "bg-muted!",
                                                                    )}
                                                                    aria-label={`${
                                                                        field.value &&
                                                                        typeof feature.aggregateInMetric !== "undefined"
                                                                            ? "Incluir"
                                                                            : "Excluir"
                                                                    } ${pathLabels[feature.id]} das métricas`}
                                                                >
                                                                    {field.value &&
                                                                    typeof feature.aggregateInMetric !== "undefined" ? (
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
                                                                    id={`${feature.id}-metric-description`}
                                                                    className="sr-only"
                                                                >
                                                                    {field.value &&
                                                                    typeof feature.aggregateInMetric !== "undefined"
                                                                        ? "Incluído nas métricas"
                                                                        : "Excluído das métricas"}
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
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Modo"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
