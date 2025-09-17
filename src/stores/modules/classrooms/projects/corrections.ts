import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import {
  createClassroomProjectCorrection,
  getAllCorrectionsByProjectId,
  getAllCorrectionsByDeliveryId,
  getAllCorrectionsByClassroomId,
  updateClassroomProjectCorrectionById,
  deleteCorrectionById,
} from "@/app/actions/classrooms/projects/corrections";
import { ClassroomProjectCorrectionT } from "@/features/dashboard/classroom-projects/types/corrections";

interface CorrectionState {
  corrections: ClassroomProjectCorrectionT[];
  loading: boolean;
}

interface CorrectionActions {
  setCorrections: (corrections: ClassroomProjectCorrectionT[]) => void;
  getAllCorrectionsByProjectId: (projectId: string) => Promise<boolean>;
  getAllCorrectionsByDeliveryId: (deliveryId: string) => Promise<boolean>;
  getAllCorrectionsByClassroomId: (classroomId: string) => Promise<boolean>;
  createCorrection: (
    correctionData: Omit<Partial<ClassroomProjectCorrectionT>, "id" | "created_at">
  ) => Promise<boolean>;
  updateCorrection: (
    id: string,
    correctionData: Partial<ClassroomProjectCorrectionT>
  ) => Promise<boolean>;
  deleteCorrection: (id: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: CorrectionState = {
  corrections: [],
  loading: false,
};

export const useCorrectionStore = create<CorrectionState & CorrectionActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCorrections: (corrections) => set({ corrections }),

      getAllCorrectionsByProjectId: async (projectId) => {
        set({ loading: true });
        try {
          if (!projectId) throw new Error("Project ID is required");
          const allCorrections = await getAllCorrectionsByProjectId(projectId);
          if (!allCorrections) throw new Error("No corrections found");
          set({ corrections: allCorrections });
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar correções. Tente novamente mais tarde.");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getAllCorrectionsByDeliveryId: async (deliveryId) => {
        set({ loading: true });
        try {
          if (!deliveryId) throw new Error("Delivery ID is required");
          const allCorrections = await getAllCorrectionsByDeliveryId(deliveryId);
          if (!allCorrections) throw new Error("No corrections found");
          set({ corrections: allCorrections });
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar correções. Tente novamente mais tarde.");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getAllCorrectionsByClassroomId: async (classroomId) => {
        set({ loading: true });
        try {
          if (!classroomId) throw new Error("Classroom ID is required");
          const allCorrections = await getAllCorrectionsByClassroomId(classroomId);
          if (!allCorrections) throw new Error("No corrections found");
          set({ corrections: allCorrections });
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar correções. Tente novamente mais tarde.");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createCorrection: async (correctionData) => {
        try {
          if (!correctionData.project_id || !correctionData.delivery_id) {
            throw new Error("Project ID and delivery ID are required");
          }
          const correctionCreated = await createClassroomProjectCorrection(
            correctionData
          );
          if (!correctionCreated) throw new Error("Correction creation failed");
          set({
            corrections: [...get().corrections, correctionCreated],
          });
          toast.success("Correção criada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao criar correção. Tente novamente mais tarde.");
          return false;
        }
      },

      updateCorrection: async (id, correctionData) => {
        try {
          if (!id || !correctionData) {
            throw new Error("Correction ID and update data are required");
          }
          const updatedCorrection = await updateClassroomProjectCorrectionById(
            id,
            correctionData
          );
          if (!updatedCorrection) throw new Error("Correction update failed");
          set({
            corrections: get().corrections.map((correction) =>
              correction.id === updatedCorrection.id ? updatedCorrection : correction
            ),
          });
          toast.success("Correção atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating correction:", error);
          toast.error("Erro ao atualizar correção. Tente novamente mais tarde.");
          return false;
        }
      },

      deleteCorrection: async (id) => {
        try {
          if (!id) throw new Error("Correction ID is required");
          const success = await deleteCorrectionById(id);
          if (!success) throw new Error("Correction deletion failed");
          set({
            corrections: get().corrections.filter(
              (correction) => correction.id !== id
            ),
          });
          toast.success("Correção deletada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error deleting correction:", error);
          toast.error("Erro ao deletar correção. Tente novamente mais tarde.");
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "CorrectionStore" }
  )
);