"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { LoaderCircle } from "lucide-react";

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Classroom } from "@/features/classrooms/types";
import { IconPicker, IconName } from "@/components/ui/icon-picker";
import { useClassroomStore } from "../store";
import ClassroomPeriodSelector from "./classroom-period-selector";
import ClassroomStatusSelector from "./classroom-status-selector";
import { ClassroomFormData, classroomFormSchema } from "../utils";

const ClassroomFormDialog = ({ currentClassroom }: { currentClassroom?: Classroom }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const { createClassroomAsync, updateClassroomAsync } = useClassroomStore();

    const form = useForm<ClassroomFormData>({
        resolver: zodResolver(classroomFormSchema),
        defaultValues: {
            name: "",
            period: "afternoon",
            status: "active",
            icon: "book-open",
        },
    });

    const handleSetModalOpen = (open: boolean) => {
        if (!open) {
            form.reset();
        }
        setModalOpen(open);
    };

    useEffect(() => {
        form.reset({
            name: currentClassroom?.name ?? "",
            period: currentClassroom?.period ?? "afternoon",
            status: currentClassroom?.status ?? "active",
            icon: currentClassroom?.icon ?? "book-open",
        });
    }, [currentClassroom, form]);

    const handleSubmit = async (data: ClassroomFormData) => {
        setLoading(true);

        try {
            if (currentClassroom) {
                const updates = {} as Partial<Classroom>;
                if (data.name !== currentClassroom.name) updates.name = data.name;
                if (data.period !== currentClassroom.period) updates.period = data.period;
                if (data.status !== currentClassroom.status) updates.status = data.status;
                if (data.icon !== currentClassroom.icon) updates.icon = data.icon;

                await updateClassroomAsync(currentClassroom.id, updates);
                toast.success({
                    title: "Turma editada com sucesso!",
                    description: `As informações da ${currentClassroom.name} foram atualizadas.`,
                });
            } else {
                await createClassroomAsync(data);
                toast.success({
                    title: "Turma criada com sucesso!",
                    description: `A turma ${data.name} foi criada com sucesso.`,
                });
            }

            handleSetModalOpen(false);
        } catch {
            toast.error({
                title: "Erro ao processar a turma",
                description: `Erro ao ${currentClassroom ? "editar" : "criar"} a turma!`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <Button className="font-semibold" variant={currentClassroom ? "outline" : "default"}>
                    {currentClassroom ? "Editar Turma" : "Adicionar Turma"}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-max">
                <DialogHeader>
                    <DialogTitle>{currentClassroom ? `Editar ${currentClassroom.name}` : "Adicionar Turma"}</DialogTitle>
                    <DialogDescription>
                        {currentClassroom
                            ? `Edite as informações da ${currentClassroom.name}`
                            : "Insira o nome (ou codinome), o período e o status da nova turma."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="flex justify-between items-start gap-4 w-full">
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Ícone</FormLabel>
                                        <FormControl>
                                            <IconPicker
                                                value={(field.value as IconName) ?? "BookOpen"}
                                                onValueChange={(iconName) => {
                                                    field.onChange(iconName);
                                                }}
                                                className="w-max"
                                                searchPlaceholder="Procurando por qual ícone?"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="font-semibold">Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o nome da turma" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-between items-start gap-4 w-full">
                            <FormField
                                control={form.control}
                                name="period"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="font-semibold">Período</FormLabel>
                                        <FormControl>
                                            <ClassroomPeriodSelector value={field.value} handleOnchange={field.onChange} />
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
                                        <FormLabel className="font-semibold">Status da turma</FormLabel>
                                        <FormControl>
                                            <ClassroomStatusSelector
                                                value={field.value || "created"}
                                                handleOnchange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="flex gap-4 mt-4 w-full">
                            <Button type="button" variant="outline" onClick={() => handleSetModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="font-semibold" disabled={loading}>
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
