"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { AuthUserWithProfileT } from "@/types";
import { Activity } from "../types/activity.types";
import ActivityTypeSelector from "../components/activity-type-selector";
import { ActivityJustificationDropdown } from "../components/activity-justification-dropdown";
import { calculateActivityDelivery } from "../utils/activity-delivery-calculator";
import { calculateUserActivityParticipation } from "../utils/activity-calculator";

interface UseActivityColumnsProps {
    displayedActivities: Activity[];
    allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
    updateActivityById: (params: { id: string; updates: Partial<Activity> }) => Promise<unknown>;
    deleteActivityById: (params: { id: string }) => Promise<boolean>;
}

export function useActivityColumns({
    displayedActivities,
    allAggregateInMetricUsers,
    updateActivityById,
    deleteActivityById,
}: UseActivityColumnsProps) {
    const activityColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] = useMemo(() => {
        return displayedActivities.map((activity, index) => ({
            id: `activity-${activity.id}-${index}`,
            header: () => (
                <div className="flex flex-col justify-center items-center border-r border-b w-[155px]! h-full">
                    <div className="flex justify-between items-center px-2 pl-4 border-border border-b w-[155px]! h-11">
                        <p className="font-bold text-center">
                            {new Date(activity.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                            })}
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => deleteActivityById({ id: activity.id })}
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Deletar atividade
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex justify-center items-center p-2 w-[155px]! h-11">
                        <ActivityTypeSelector
                            key={`ActivityTypeSelector-${activity.id}-${index}`}
                            value={activity.class_type}
                            handleValueChange={(value) =>
                                updateActivityById({
                                    id: activity.id,
                                    updates: { class_type: value },
                                })
                            }
                        />
                    </div>
                    <div className="flex justify-center items-center gap-1 px-2 border-t w-[155px]! h-11">
                        <p>{calculateActivityDelivery(activity, allAggregateInMetricUsers)}%</p>
                    </div>
                </div>
            ),
            cell: ({ row }) => {
                const userEmail = row.original.email;
                const shouldAggregateInMetric = allAggregateInMetricUsers.some((user) => user.email === userEmail);

                const participationResult = calculateUserActivityParticipation(
                    activity,
                    userEmail || "",
                    shouldAggregateInMetric,
                );

                return (
                    <div className="flex justify-between items-center gap-1 px-2 border-border border-r border-b w-[155px]! h-[57px]">
                        <div className="flex flex-col">
                            <p className={cn("font-semibold", participationResult.color)} title={participationResult.label}>
                                {participationResult.status}
                            </p>
                        </div>
                        {participationResult.allowJustification && userEmail && (
                            <ActivityJustificationDropdown
                                key={`ActivityJustificationDropdown-${activity.id}-${index}`}
                                currentActivity={activity}
                                currentUserEmail={userEmail}
                            />
                        )}
                    </div>
                );
            },
        }));
    }, [displayedActivities, allAggregateInMetricUsers, updateActivityById, deleteActivityById]);

    return activityColumns;
}
