import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/lib/toast";

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

                    const activityById = await toast.promise(getActivityById({ id }), {
                        loading: {
                            title: "Carregando atividade...",
                        },
                        success: {
                            title: "Atividade carregada com sucesso!",
                        },
                        error: {
                            title: "Erro!",
                            description: "Erro ao carregar atividade. Tente novamente mais tarde!",
                        },
                    });

                    if (!activityById) throw new Error("no activity by ID");

                    return activityById;
                } catch (error) {
                    log.error({ err: error, activityId: id, operation: "getActivityById" }, "Error on getting activity by id");

                    toast.error({ title: "Erro!", description: "Erro ao carregar atividade. Tente novamente mais tarde!" });
                    return null;
                } finally {
                    set({ loading: false });
                }
            },

            createActivity: async ({ activityData }) => {
                try {
                    if (!activityData.classroom_id) {
                        toast.error({ title: "Erro!", description: "o ID da turma é obrigatório!" });
                        throw new Error("Missing required field: classroom_id");
                    }

                    const newActivity = await toast.promise(createActivity({ activityData }), {
                        loading: {
                            title: "Criando atividade...",
                        },
                        success: {
                            title: "Atividade criada com sucesso!",
                        },
                        error: {
                            title: "Erro!",
                            description: "Erro ao criar atividade. Tente novamente mais tarde!",
                        },
                    });
                    if (!newActivity) throw new Error("no activity create response");

                    set((prev) => {
                        const activities = [...prev.activities, newActivity];

                        return { activities };
                    });

                    log.info({ newActivity }, "New activity created");

                    return newActivity;
                } catch (error) {
                    log.error({ err: error, activityData, operation: "createActivity" }, "Error creating activity:");

                    toast.error({ title: "Erro!", description: "Erro ao criar nova atividade. Tente novamente mais tarde!" });
                    return false;
                }
            },

            createMultipleActivities: async ({ activitiesData }) => {
                try {
                    if (!activitiesData || activitiesData.length === 0) {
                        toast.error({ title: "Erro!", description: "Nenhuma atividade foi fornecida!" });
                        return false;
                    }

                    // Validate required fields
                    for (const activityData of activitiesData) {
                        if (!activityData.classroom_id) {
                            toast.error({
                                title: "Erro!",
                                description: "ID da turma está faltando em uma ou mais atividades!",
                            });
                            return false;
                        }
                    }

                    const newActivities = await toast.promise(createMultipleActivities({ activitiesData }), {
                        loading: {
                            title: `Criando ${activitiesData.length} atividades...`,
                        },
                        success: {
                            title: "Atividades criadas com sucesso!",
                            description: `${activitiesData.length} atividades criadas com sucesso!`,
                        },
                        error: {
                            title: "Erro!",
                            description: "Erro ao criar múltiplas atividades. Tente novamente mais tarde!",
                        },
                    });

                    if (!newActivities) throw new Error("no multiple activities create response");

                    set((prev) => {
                        const prevActivitiesWithNewActivities = [...prev.activities, ...newActivities];

                        return { activities: prevActivitiesWithNewActivities };
                    });

                    log.info({ newActivities }, "New activities created");

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, operation: "createMultipleActivities", activitiesData },
                            "Error creating multiple activities",
                        );
                    }

                    toast.error({ title: "Erro!", description: "Erro ao criar múltiplas atividades!" });
                    return false;
                }
            },

            updateActivityById: async ({ id, updates }) => {
                try {
                    if (!id || !updates) {
                        throw new Error("id and updates fields are required");
                    }

                    const updatedActivity = await toast.promise(updateActivityById({ id, updates }), {
                        loading: {
                            title: "Atualizando atividade...",
                        },
                        success: {
                            title: "Atividade atualizada com sucesso!",
                        },
                        error: {
                            title: "Erro!",
                            description: "Erro ao atualizar atividade!",
                        },
                    });
                    if (!updatedActivity) throw new Error("no updated activity returned");

                    set((prev) => {
                        const updatedActivities = prev.activities.map((activity) =>
                            activity.id === id ? { ...activity, ...updatedActivity } : activity,
                        );

                        return {
                            ...prev,
                            activities: updatedActivities,
                        };
                    });

                    return updatedActivity;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, data: { id, updates }, operation: "updateActivityById" },
                            "Error updating activity:",
                        );
                    }

                    toast.error({ title: "Erro!", description: "Erro ao atualizar a atividade!" });
                    return false;
                }
            },

            deleteActivityById: async ({ id }) => {
                try {
                    if (!id) throw new Error("activity id is required to delete");

                    const isActivityDeleted = await toast.promise(deleteActivityById({ id }), {
                        loading: {
                            title: "Deletando atividade...",
                        },
                        success: {
                            title: "Atividade deletada com sucesso!",
                        },
                        error: {
                            title: "Erro!",
                            description: "Erro ao deletar atividade!",
                        },
                    });
                    if (!isActivityDeleted) throw new Error("no delete activity response");

                    set((prev) => {
                        const updatedActivities = prev.activities.filter((activity) => activity.id !== id);

                        return {
                            ...prev,
                            activities: updatedActivities,
                        };
                    });

                    return true;
                } catch (error) {
                    log.error({ err: error, activityId: id, operation: "deleteActivityById" }, "Error deleting activity");

                    toast.error({ title: "Erro!", description: "Erro ao deletar atividade. Tente novamente mais tarde!" });

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
