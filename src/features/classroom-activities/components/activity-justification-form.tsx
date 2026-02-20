"use client";

import { Loader, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ActivityJustificationFormProps } from "./activity-justification-dropdown.types";

/**
 * Form for adding, editing, or removing a justification for an activity.
 */
export function ActivityJustificationForm({
    justification,
    currentJustification,
    loading,
    deleteLoading,
    onJustificationChange,
    onSave,
    onDelete,
}: Readonly<ActivityJustificationFormProps>) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <span className="font-medium text-sm">Justificativa:</span>
            <Textarea
                value={justification}
                onChange={(e) => onJustificationChange(e.target.value)}
                placeholder="Adicione uma justificativa (opcional)"
                className="w-full h-20 resize-none"
            />

            <div className="flex flex-row justify-end items-center gap-2 w-full">
                {currentJustification && (
                    <Button
                        disabled={loading || deleteLoading}
                        onClick={onDelete}
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
                    onClick={onSave}
                    className="px-8! cursor-pointer"
                >
                    {loading && <Loader className="size-4 animate-spin" />}
                    {!loading ? (!currentJustification ? "Salvar" : "Editar") : "Salvando..."}
                </Button>
            </div>
        </div>
    );
}
