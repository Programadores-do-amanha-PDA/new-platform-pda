import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { getSettingByClassroomId, getSettingById, createSetting, updateSettingById, deleteSettingById } from "./actions";
import { Setting } from "./types";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "classroom.management.settings" });

interface SettingState {
    settingsByClassroom: Record<string, Setting>;
    loading: boolean;
}

interface SettingActions {
    setSettingByClassroomId: ({ classroomId, setting }: { classroomId: string; setting: Setting }) => void;
    fetchSettingByClassroomId: ({ classroomId }: { classroomId: string }) => Promise<void>;
    getSettingById: ({ id }: { id: string }) => Promise<Setting | boolean>;
    createNewSetting: ({ settingData }: { settingData: Partial<Omit<Setting, "id" | "created_at">> }) => Promise<boolean>;
    updateSettingById: ({
        id,
        updates,
    }: {
        id: string;
        updates: Partial<Omit<Setting, "id" | "created_at">>;
    }) => Promise<boolean>;
    deleteSettingById: ({ id }: { id: string }) => Promise<boolean>;
    reset: () => void;
}

const initialState: SettingState = {
    settingsByClassroom: {},
    loading: false,
};

export const useSettingStore = create<SettingState & SettingActions>()(
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

                    if (!settingResponse) {
                        get().createNewSetting({ settingData: { classroom_id: classroomId, modules: [] } });
                    } else if (settingResponse.length === 0) {
                        get().createNewSetting({ settingData: { classroom_id: classroomId, modules: [] } });
                    }
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

                    const settingResponse = await getSettingById({ id });
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

                    const newSetting = await createSetting({ settingData });
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

            updateSettingById: async ({ id, updates }) => {
                let loadingToastId;
                try {
                    if (!id || !updates || Object.keys(updates).length === 0) {
                        throw new Error("id and updates fields are required");
                    }

                    loadingToastId = toast.loading("Atualizando a configuração...");
                    const updatedSetting = await updateSettingById({ id, updates });
                    if (!updatedSetting) throw new Error("no update setting response");

                    get().setSettingByClassroomId({ classroomId: updatedSetting.classroom_id, setting: updatedSetting });

                    toast.success("Configuração atualizada com sucesso!");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, id, updates, operation: "updateSettingById" }, "Error updating setting");
                    }

                    toast.error("Erro ao atualizar a configuração. Tente novamente mais tarde!");

                    return false;
                } finally {
                    if (loadingToastId) toast.dismiss(loadingToastId);
                }
            },

            deleteSettingById: async ({ id }) => {
                try {
                    if (!id) throw new Error("Setting id is required to delete");

                    const settingToDelete = Object.values(get().settingsByClassroom).find((setting) => setting.id === id);

                    if (!settingToDelete) throw new Error("Setting not found");

                    const isSettingDeleted = await deleteSettingById({ id });
                    if (!isSettingDeleted) throw new Error("no delete setting response");

                    set((prev) => {
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
