"use client";

import { Pen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useActivityJustification } from "./use-activity-justification";
import { ActivityParticipationToggle } from "./activity-participation-toggle";
import { ActivityJustificationForm } from "./activity-justification-form";
import { ActivityJustificationDropdownProps } from "./activity-justification-dropdown.types";

/**
 * Dropdown menu for managing activity participation and justifications.
 * Delegates all state and business logic to the useActivityJustification hook.
 */
export function ActivityJustificationDropdown({
    currentActivity,
    currentUserEmail,
}: Readonly<ActivityJustificationDropdownProps>) {
    const {
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
    } = useActivityJustification({ currentActivity, currentUserEmail });

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                    <Pen className="stroke-muted-foreground size-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
                <DropdownMenuLabel>Gerenciar Atividade</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="flex flex-col gap-3 p-2 w-full">
                    <ActivityParticipationToggle
                        hasParticipated={hasParticipated}
                        loading={participationLoading}
                        onToggle={handleToggleParticipation}
                    />

                    <DropdownMenuSeparator />

                    <ActivityJustificationForm
                        justification={justification}
                        currentJustification={currentJustification}
                        loading={loading}
                        deleteLoading={deleteLoading}
                        onJustificationChange={setJustification}
                        onSave={handleAddJustification}
                        onDelete={handleDeleteJustification}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
