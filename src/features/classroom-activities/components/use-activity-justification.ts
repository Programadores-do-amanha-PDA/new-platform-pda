import { useState } from "react";
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
    const currentJustification = currentActivity.justifications?.find((j) => j.user_email === currentUserEmail);
    const [justification, setJustification] = useState<string>(() => {
        if (currentJustification) {
            return currentJustification.message || "";
        }
        return "";
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [participationLoading, setParticipationLoading] = useState<boolean>(false);

    const { updateActivityById } = useActivityStore();

    const hasParticipated = currentActivity.participants_email?.includes(currentUserEmail) ?? false;

    const handleAddJustification = async () => {
        setLoading(true);

        const existingJustifications = currentActivity.justifications || [];
        const updatedJustifications = currentJustification
            ? existingJustifications.map((existJustification) =>
                  existJustification.user_email === currentUserEmail
                      ? { ...existJustification, message: justification }
                      : existJustification,
              )
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

        setLoading(false);
    };

    const handleDeleteJustification = async () => {
        setDeleteLoading(true);
        await updateActivityById({
            id: currentActivity.id,
            updates: {
                justifications: currentActivity?.justifications?.filter((j) => j.user_email !== currentUserEmail) || [],
            },
        });
        setJustification("");
        setDeleteLoading(false);
    };

    const handleToggleParticipation = async () => {
        setParticipationLoading(true);
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

        setParticipationLoading(false);
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
