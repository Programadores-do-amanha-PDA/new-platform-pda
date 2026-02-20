import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useActivityStore } from "../store";
import { ClassActivity } from "../types";

interface UseActivityJustificationProps {
    readonly currentActivity: ClassActivity;
    readonly currentUserEmail: string;
}

/**
 * Manages participation and justification state for a single ClassActivity.
 *
 * @param currentActivity - The activity being managed.
 * @param currentUserEmail - The email of the current user.
 * @returns State values and async handlers for participation and justification actions.
 */
export const useActivityJustification = ({ currentActivity, currentUserEmail }: UseActivityJustificationProps) => {
    const [justification, setJustification] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [participationLoading, setParticipationLoading] = useState<boolean>(false);

    const { updateActivityById } = useActivityStore();

    const currentJustification = currentActivity.justifications?.find((j) => j.user_email === currentUserEmail);
    const hasParticipated = currentActivity.participants_email?.includes(currentUserEmail) ?? false;

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

    return {
        justification,
        setJustification,
        loading,
        deleteLoading,
        participationLoading,
        currentJustification,
        hasParticipated,
        handleAddJustification,
        handleDeleteJustification,
        handleToggleParticipation,
    } as const;
};
