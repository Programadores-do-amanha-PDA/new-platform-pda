"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader, Pen, Trash, UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

import { useActivityStore } from "../store";
import { Activity } from "../types";

export function ActivityJustificationDropdown({
    currentActivity,
    currentUserEmail,
}: {
    currentActivity: Activity;
    currentUserEmail: string;
}) {
    const [justification, setJustification] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [participationLoading, setParticipationLoading] = useState<boolean>(false);

    const { updateActivityById } = useActivityStore();

    const currentJustification = currentActivity.justifications?.find((j) => j.user_email === currentUserEmail);

    const hasParticipated = currentActivity.participants_email?.includes(currentUserEmail);

    useEffect(() => {
        if (currentJustification) {
            setJustification(currentJustification.message || "");
        }
    }, [currentActivity, currentJustification]);

    const handleAddJustification = async () => {
        setLoading(true);
        try {
            const existingJustifications = currentActivity.justifications || [];
            const updatedJustifications = currentJustification
                ? existingJustifications.map((j) => (j.user_email === currentUserEmail ? { ...j, message: justification } : j))
                : [
                      ...existingJustifications,
                      {
                          user_email: currentUserEmail,
                          message: justification,
                      },
                  ];

            await updateActivityById({
                id: currentActivity.id,
                updates: {
                    justifications: updatedJustifications,
                },
            });

            toast.success("Justificativa salva com sucesso!");
        } catch {
            toast.error("Erro ao salvar justificativa!");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJustification = async () => {
        setDeleteLoading(true);
        try {
            await updateActivityById({
                id: currentActivity.id,
                updates: {
                    justifications: currentActivity?.justifications?.filter((j) => j.user_email !== currentUserEmail) || [],
                },
            });
            setJustification("");
            toast.success("Justificativa removida com sucesso!");
        } catch {
            toast.error("Erro ao remover justificativa!");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleToggleParticipation = async () => {
        setParticipationLoading(true);
        try {
            const currentParticipants = currentActivity.participants_email || [];
            const updatedParticipants = hasParticipated
                ? currentParticipants.filter((email) => email !== currentUserEmail)
                : [...currentParticipants, currentUserEmail];

            await updateActivityById({
                id: currentActivity.id,
                updates: {
                    participants_email: updatedParticipants,
                },
            });

            toast.success(hasParticipated ? "Participação removida com sucesso!" : "Participação adicionada com sucesso!");
        } catch {
            toast.error("Erro ao atualizar participação!");
        } finally {
            setParticipationLoading(false);
        }
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="ml-auto">
                    <Pen className="stroke-muted-foreground size-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
                <DropdownMenuLabel>Gerenciar Atividade</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="flex flex-col gap-3 p-2 w-full">
                    {/* Participation Toggle */}
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Participação:</span>
                        <Button
                            disabled={participationLoading}
                            onClick={handleToggleParticipation}
                            size="sm"
                            variant={hasParticipated ? "default" : "outline"}
                            className="gap-2"
                        >
                            {participationLoading ? (
                                <Loader className="size-4 animate-spin" />
                            ) : hasParticipated ? (
                                <UserCheck className="size-4" />
                            ) : (
                                <UserX className="size-4" />
                            )}
                            {hasParticipated ? "Participou" : "Não Participou"}
                        </Button>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Justification Section */}
                    <div className="flex flex-col gap-2 w-full">
                        <span className="font-medium text-sm">Justificativa:</span>
                        <Textarea
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            placeholder="Adicione uma justificativa (opcional)"
                            className="w-full h-20 resize-none"
                        />

                        <div className="flex flex-row justify-end items-center gap-2 w-full">
                            {currentJustification && (
                                <Button
                                    disabled={loading || deleteLoading}
                                    onClick={handleDeleteJustification}
                                    size="icon"
                                    variant="destructive"
                                    className="min-w-9! cursor-pointer"
                                >
                                    {!deleteLoading ? <Trash className="size-4" /> : <Loader className="size-4 animate-spin" />}
                                </Button>
                            )}

                            <Button
                                disabled={
                                    loading ||
                                    deleteLoading ||
                                    !justification.trim() ||
                                    (currentJustification && currentJustification.message === justification)
                                }
                                onClick={handleAddJustification}
                                className="px-8! cursor-pointer"
                            >
                                {loading && <Loader className="size-4 animate-spin" />}
                                {!loading ? (!currentJustification ? "Salvar" : "Editar") : "Salvando..."}
                            </Button>
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
