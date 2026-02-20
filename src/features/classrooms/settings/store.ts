import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { ClassroomSetting } from "./types";
import { logger } from "@/lib/logger";
import {
    getSettingByClassroomId,
    createClassroomSetting,
    updateClassroomSettingById,
    deleteClassroomSettingById,
    getClassroomSettingById,
} from "./actions";

const log = logger.child({ module: "classroom.management.settings" });

interface ClassroomSettingState {
    settingsByClassroom: Record<string, ClassroomSetting>;
    loading: boolean;
}

interface ClassroomSettingActions {
    setSettingByClassroomId: ({ classroomId, setting }: { classroomId: string; setting: ClassroomSetting }) => void;
    fetchSettingByClassroomId: ({ classroomId }: { classroomId: string }) => Promise<void>;
    getSettingById: ({ id }: { id: string }) => Promise<ClassroomSetting | boolean>;
    createNewSetting: ({
        settingData,
    }: {
        settingData: Partial<Omit<ClassroomSetting, "id" | "created_at">>;
    }) => Promise<boolean>;
    updateClassroomSettingById: ({
        id,
        updates,
    }: {
        id: string;
        updates: Partial<Omit<ClassroomSetting, "id" | "created_at">>;
    }) => Promise<boolean>;
    deleteClassroomSettingById: ({ id }: { id: string }) => Promise<boolean>;
    reset: () => void;
}

const initialState: ClassroomSettingState = {
    settingsByClassroom: {},
    loading: false,
};

export const useClassroomSettingStore = create<ClassroomSettingState & ClassroomSettingActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setSettingByClassroomId: ({ classroomId, setting }) => {
                try {
                    if (!classroomId || !setting) {
                        throw new Error("Missing required fields: classroomId and setting");
                    }

                    set((state) => ({
                        settingsByClassroom: {
                            ...state.settingsByClassroom,
                            [classroomId]: setting,
                        },
                    }));
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, operation: "setSettingByClassroomId" }, "Error on set setting by classroom");
                    }
                }
            },

            fetchSettingByClassroomId: async ({ classroomId }) => {
                try {
                    set({ loading: true });

                    const settingResponse = await getSettingByClassroomId({ classroomId });

                    // If no setting exists, create a new one with default values
                    if (!settingResponse) {
                        get().createNewSetting({ settingData: { classroom_id: classroomId, modules: [] } });
                        return;
                    }

                    get().setSettingByClassroomId({ classroomId, setting: settingResponse });
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn(
                            { err: error, classroomId, operation: "fetchSettingByClassroomId" },
                            "Error fetching setting by classroom",
                        );
                    }
                } finally {
                    set({ loading: false });
                }
            },

            getSettingById: async ({ id }) => {
                try {
                    set({ loading: true });

                    const settingResponse = await getClassroomSettingById({ id });
                    if (!settingResponse) throw new Error("no setting response");

                    return settingResponse;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, id, operation: "getSettingById" }, "Error fetching setting by ID:");
                    }

                    toast.error("Erro ao buscar a configuração. Tente novamente mais tarde!");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createNewSetting: async ({ settingData }) => {
                try {
                    if (!settingData.classroom_id) {
                        throw new Error("Missing required field: classroom_id");
                    }

                    const newSetting = await createClassroomSetting({ settingData });
                    if (!newSetting) throw new Error("no setting create response");

                    get().setSettingByClassroomId({ classroomId: settingData.classroom_id, setting: newSetting });

                    toast.success("Configuração criada com sucesso!");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, settingData, operation: "createNewSetting" }, "Error creating setting");
                    }

                    toast.error("Erro ao criar nova configuração. Tente novamente mais tarde!");
                    return false;
                }
            },

            updateClassroomSettingById: async ({ id, updates }) => {
                let loadingToastId;
                try {
                    if (!id || !updates || Object.keys(updates).length === 0) {
                        throw new Error("id and updates fields are required");
                    }

                    loadingToastId = toast.loading("Atualizando a configuração...");
                    const updatedSetting = await updateClassroomSettingById({ id, updates });
                    if (!updatedSetting) throw new Error("no update setting response");

                    get().setSettingByClassroomId({ classroomId: updatedSetting.classroom_id, setting: updatedSetting });

                    toast.success("Configuração atualizada com sucesso!");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn(
                            { err: error, id, updates, operation: "updateClassroomSettingById" },
                            "Error updating setting",
                        );
                    }

                    toast.error("Erro ao atualizar a configuração. Tente novamente mais tarde!");

                    return false;
                } finally {
                    if (loadingToastId) toast.dismiss(loadingToastId);
                }
            },

            deleteClassroomSettingById: async ({ id }) => {
                try {
                    if (!id) throw new Error("ClassroomSetting id is required to delete");

                    const settingToDelete = Object.values(get().settingsByClassroom).find((setting) => setting.id === id);

                    if (!settingToDelete) throw new Error("ClassroomSetting not found");

                    const isSettingDeleted = await deleteClassroomSettingById({ id });
                    if (!isSettingDeleted) throw new Error("no delete setting response");

                    set((prev) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [settingToDelete.classroom_id]: _, ...remainingSettingsByClassroom } = prev.settingsByClassroom;
                        return { settingsByClassroom: remainingSettingsByClassroom };
                    });

                    toast.success("configuração deletada com sucesso!");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, id, operation: "deleteSetting" }, "Error deleting setting");
                    }

                    toast.error("Erro ao deletar configuração. Tente novamente mais tarde!");
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "SettingStore" },
    ),
);
