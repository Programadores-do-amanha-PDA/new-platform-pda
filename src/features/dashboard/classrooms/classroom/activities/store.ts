import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
import {
    getAllActivitiesByClassroomId,
    getActivityById,
    createActivity,
    createMultipleActivities,
    updateActivityById,
    deleteActivityById,
} from "./actions";
import { ActivityActions, ActivityStoreState } from "./types";

const log = logger.child({ module: "classroom.activities-store" });

const initialState: ActivityStoreState = {
    activities: [],
    loading: false,
};

export const useActivityStore = create<ActivityStoreState & ActivityActions>()(
    devtools(
        (set) => ({
            ...initialState,

            setActivities: ({ activities }) => set({ activities }),

            fetchAllActivitiesByClassroom: async ({ classroomId }) => {
                try {
                    set({ loading: true });

                    const allActivitiesByClassroom = await getAllActivitiesByClassroomId({ classroomId });
                    if (!allActivitiesByClassroom) throw new Error("no classroom activities");

                    set({ activities: allActivitiesByClassroom });
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn(
                            { err: error, classroomId, operation: "fetchAllActivitiesByClassroom" },
                            "an error occurred on fetch activities classroom",
                        );
                    }

                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getActivityById: async ({ id }) => {
                try {
                    if (!id) throw new Error("Required ID field is missing");
                    set({ loading: true });

                    const activityById = await getActivityById({ id });
                    if (!activityById) throw new Error("no activity by ID");

                    return activityById;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn(
                            { err: error, activityId: id, operation: "getActivityById" },
                            "Error on getting activity by id",
                        );
                    }
                    return null;
                } finally {
                    set({ loading: false });
                }
            },

            createActivity: async ({ activityData }) => {
                try {
                    if (!activityData.classroom_id) {
                        toast.error("o ID da turma é obrigatório!");
                        throw new Error("Missing required field: classroom_id");
                    }

                    const newActivity = await createActivity({ activityData });
                    if (!newActivity) throw new Error("no activity create response");

                    set((prev) => {
                        const activities = [...prev.activities, newActivity];

                        return { activities };
                    });

                    log.info({ newActivity }, "New activity created");
                    toast.success("Atividade criada com sucesso!");

                    return newActivity;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, activityData, operation: "createActivity" }, "Error creating activity:");
                    }

                    toast.error("Erro ao criar nova atividade. Tente novamente mais tarde!");
                    return false;
                }
            },

            createMultipleActivities: async ({ activitiesData }) => {
                let loadingToastId;
                try {
                    if (!activitiesData || activitiesData.length === 0) {
                        toast.error("Nenhuma atividade foi fornecida!");
                        throw new Error("No activities data provided");
                    }

                    // Validate required fields
                    for (const activityData of activitiesData) {
                        if (!activityData.classroom_id) {
                            toast.error("ID da turma está faltando em uma ou mais atividades!");
                            throw new Error("The required classroom ID field is missing in one or more activities.");
                        }
                    }

                    loadingToastId = toast.loading(`Criando ${activitiesData.length} atividades...`);

                    const newActivities = await createMultipleActivities({ activitiesData });
                    if (!newActivities) throw new Error("no multiple activities create response");

                    set((prev) => {
                        const prevActivitiesWithNewActivities = [...prev.activities, ...newActivities];

                        return { activities: prevActivitiesWithNewActivities };
                    });

                    toast.dismiss(loadingToastId);
                    log.info({ newActivities }, "New activities created");

                    toast.success(`${newActivities.length} atividades criadas com sucesso!`);
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, operation: "createMultipleActivities", activitiesData },
                            "Error creating multiple activities",
                        );
                    }

                    toast.error("Erro ao criar múltiplas atividades!");
                    return false;
                } finally {
                    if (loadingToastId) toast.dismiss(loadingToastId);
                }
            },

            updateActivityById: async ({ id, updates }) => {
                try {
                    if (!id || !updates) {
                        throw new Error("id and updates fields are required");
                    }

                    const loadingToastId = toast.loading("Atualizando atividade...");
                    const updatedActivity = await updateActivityById({ id, updates });
                    if (!updatedActivity) throw new Error("no update activity response");

                    set((prev) => {
                        const updatedActivities = prev.activities.map((activity) =>
                            activity.id === id ? { ...activity, ...updatedActivity } : activity,
                        );

                        return {
                            ...prev,
                            activities: updatedActivities,
                        };
                    });

                    toast.dismiss(loadingToastId);
                    toast.success("Atividade atualizada com sucesso!");

                    return updateActivityById;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, data: { id, updates }, operation: "updateActivityById" },
                            "Error updating activity:",
                        );
                    }

                    toast.error("Erro ao atualizar a atividade!");
                    return false;
                }
            },

            deleteActivityById: async ({ id }) => {
                try {
                    if (!id) throw new Error("activity id is required to delete");

                    const isActivityDeleted = await deleteActivityById({ id });
                    if (!isActivityDeleted) throw new Error("no delete activity response");

                    set((prev) => {
                        const updatedActivities = prev.activities.filter((activity) => activity.id !== id);

                        return {
                            ...prev,
                            activities: updatedActivities,
                        };
                    });

                    toast.success("Atividade deletada com sucesso!");

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, activityId: id, operation: "deleteActivityById" }, "Error deleting activity");
                    }
                    toast.error("Erro ao deletar atividade. Tente novamente mais tarde!");

                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "ClassroomActivityStore" },
    ),
);
