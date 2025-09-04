import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getConfigByClassroomId,
  getConfigById,
  createConfig,
  updateConfigById,
  deleteConfigById,
} from "@/app/actions/classrooms/configs";
import { ClassroomConfigT } from "@/types/classroom-configs";
import { toast } from "sonner";

interface ClassroomConfigState {
  configsByClassroom: Record<string, ClassroomConfigT>;
  loading: boolean;
}

interface ClassroomConfigActions {
  setConfig: (classroomId: string, config: ClassroomConfigT) => void;
  getConfigByClassroom: (classroomId: string) => Promise<boolean>;
  getConfigById: (configId: string) => Promise<ClassroomConfigT | boolean>;
  createConfig: (
    configData: Partial<Omit<ClassroomConfigT, "id" | "created_at">>
  ) => Promise<boolean>;
  updateConfigById: (
    configId: string,
    updates: Partial<Omit<ClassroomConfigT, "id" | "created_at">>
  ) => Promise<boolean>;
  deleteConfig: (configId: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: ClassroomConfigState = {
  configsByClassroom: {},
  loading: false,
};

export const useClassroomConfigStore = create<
  ClassroomConfigState & ClassroomConfigActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setConfig: (classroomId, config) =>
        set((state) => ({
          configsByClassroom: {
            ...state.configsByClassroom,
            [classroomId]: config,
          },
        })),

      getConfigByClassroom: async (classroomId) => {
        try {
          set({ loading: true });
          const configResponse = await getConfigByClassroomId(classroomId);
          if (!configResponse) {
            // Se não existe config, criar uma nova
            const newConfig = await createConfig({
              classroom_id: classroomId,
              modules: [],
            });
            if (newConfig) {
              get().setConfig(classroomId, newConfig);
              return true;
            }
            return false;
          }
          get().setConfig(classroomId, configResponse);
          return true;
        } catch (error) {
          console.error("Error fetching config by classroom:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getConfigById: async (configId) => {
        try {
          set({ loading: true });
          const configResponse = await getConfigById(configId);
          if (!configResponse) throw "no config response";
          return configResponse;
        } catch (error) {
          console.error("Error fetching config by ID:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createConfig: async (configData) => {
        try {
          if (!configData.classroom_id) {
            toast.error("ID da turma é obrigatório!");
            throw new Error("Missing required field: classroom_id");
          }

          const newConfig = await createConfig(configData);
          if (!newConfig) throw new Error("no config create response");

          get().setConfig(configData.classroom_id, newConfig);
          toast.success("Configuração criada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error creating config:", error);
          toast.error("Erro ao criar nova configuração!");
          return false;
        }
      },

      updateConfigById: async (configId, updates) => {
        let loadingToastId;
        try {
          if (!configId || !updates) {
            throw new Error("id and updates fields are required");
          }

          loadingToastId = toast.loading("Atualizando configuração...");
          const updatedConfig = await updateConfigById(configId, updates);
          if (!updatedConfig) throw new Error("no update config response");

          // Atualizar no estado local
          get().setConfig(updatedConfig.classroom_id, updatedConfig);

          toast.success("Configuração atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating config:", error);
          toast.error("Erro ao atualizar a configuração!");
          return false;
        } finally {
          if (loadingToastId) toast.dismiss(loadingToastId);
        }
      },

      deleteConfig: async (configId) => {
        try {
          if (!configId) throw new Error("config id is required to delete");

          // Encontrar a config para obter o classroom_id
          const configToDelete = Object.values(get().configsByClassroom).find(
            (config) => config.id === configId
          );

          if (!configToDelete) throw new Error("config not found");

          const response = await deleteConfigById(configId);
          if (!response) throw new Error("no delete config response");

          // Remover do estado local
          set((state) => {
            const newConfigs = { ...state.configsByClassroom };
            delete newConfigs[configToDelete.classroom_id];
            return { configsByClassroom: newConfigs };
          });

          toast.success("Configuração deletada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error deleting config:", error);
          toast.error(
            "Erro ao deletar configuração. Tente novamente mais tarde!"
          );
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ClassroomConfigStore" }
  )
);
