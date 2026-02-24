"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoodeshAssessmentStore } from "../../stores/assessments";
import { CoodeshAssessmentPayload, CoodeshAssessment } from "../../types";

const assessmentFormSchema = z.object({
    name: z
        .string()
        .min(1, "Nome é obrigatório")
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(100, "Nome deve ter no máximo 100 caracteres"),
    description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
    default_locale: z.enum(["pt", "en", "es"]),
    duration: z.number().min(1, "Duração deve ser pelo menos 1").max(480, "Duração deve ser no máximo 480 minutos"),
    duration_unit: z.enum(["minute", "hour"]),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormDialogProps {
    currentAssessment?: CoodeshAssessmentPayload;
    classroomId?: string;
    onSubmit?: (data: AssessmentFormData) => Promise<void>;
}

const AssessmentFormDialog = ({ currentAssessment, classroomId, onSubmit }: AssessmentFormDialogProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const { createManualAssessment, updateAssessment } = useCoodeshAssessmentStore();

    const form = useForm<AssessmentFormData>({
        resolver: zodResolver(assessmentFormSchema),
        defaultValues: {
            name: "",
            description: "",
            default_locale: "pt",
            duration: 90,
            duration_unit: "minute",
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
            name: currentAssessment?.name ?? "",
            description: currentAssessment?.description ?? "",
            default_locale: (currentAssessment?.default_locale as "pt" | "en" | "es") ?? "pt",
            duration: currentAssessment?.duration ?? 90,
            duration_unit: (currentAssessment?.duration_unit as "minute" | "hour") ?? "minute",
        });
    }, [currentAssessment, form]);

    const handleSubmit = async (data: AssessmentFormData) => {
        setLoading(true);

        try {
            if (onSubmit) {
                await onSubmit(data);
            } else if (currentAssessment) {
                // Update existing assessment
                await updateAssessment(currentAssessment as CoodeshAssessment, data);
            } else if (classroomId) {
                // Create new manual assessment
                await createManualAssessment(classroomId, data);
            } else {
                throw new Error("classroom_id is required for creating new assessments");
            }

            handleSetModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error({
                title: "Erro ao processar avaliação",
                description: `Ocorreu um Erro ao ${currentAssessment ? "editar" : "criar"} a avaliação. Tente novamente mais tarde!`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <Button className="font-semibold" variant={"outline"}>
                    {currentAssessment ? "Editar Avaliação" : "Criar Avaliação"}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-[70vw]">
                <DialogHeader>
                    <DialogTitle>{currentAssessment ? `Editar ${currentAssessment.name}` : "Criar Avaliação"}</DialogTitle>
                    <DialogDescription>
                        {currentAssessment
                            ? `Edite as informações da avaliação ${currentAssessment.name}`
                            : "Insira as informações da nova avaliação."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">Titulo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o nome da avaliação" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Digite a descrição da avaliação (opcional)"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between items-start gap-4 w-full">
                            <FormField
                                control={form.control}
                                name="default_locale"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="font-semibold">Idioma</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue placeholder="Selecione o idioma" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem className="cursor-pointer" value="pt">
                                                    Português
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="en">
                                                    Inglês
                                                </SelectItem>
                                                <SelectItem className="cursor-pointer" value="es">
                                                    Espanhol
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="duration_unit"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="font-semibold">Unidade de Tempo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue placeholder="Selecione a unidade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="minute" className="cursor-pointer">
                                                    Minutos
                                                </SelectItem>
                                                <SelectItem value="hour" className="cursor-pointer">
                                                    Horas
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Duração</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="90"
                                                min={1}
                                                max={480}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                {currentAssessment ? "Salvar alterações" : "Criar avaliação"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AssessmentFormDialog;
