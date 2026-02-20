"use client";

import { Loader, UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ActivityParticipationToggleProps } from "./activity-justification-dropdown.types";

/**
 * Toggle button for recording whether the current user participated in an activity.
 */
export function ActivityParticipationToggle({
    hasParticipated,
    loading,
    onToggle,
}: Readonly<ActivityParticipationToggleProps>) {
    return (
        <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Participação:</span>
            <Button
                disabled={loading}
                onClick={onToggle}
                size="sm"
                variant={hasParticipated ? "default" : "outline"}
                className="gap-2"
            >
                {loading ? (
                    <Loader className="size-4 animate-spin" />
                ) : hasParticipated ? (
                    <UserCheck className="size-4" />
                ) : (
                    <UserX className="size-4" />
                )}
                {hasParticipated ? "Participou" : "Não Participou"}
            </Button>
        </div>
    );
}
