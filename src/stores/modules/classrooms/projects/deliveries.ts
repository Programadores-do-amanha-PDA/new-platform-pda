import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import {
  createClassroomProjectDelivery,
  getAllDeliveriesByProjectId,
  updateClassroomProjectDeliveryById,
  deleteDeliveryById,
} from "@/app/actions/classrooms/projects/deliveries";
import { ClassroomProjectDeliveryT } from "@/types/classroom-projects/delivery";

interface DeliveryState {
  deliveries: ClassroomProjectDeliveryT[];
  loading: boolean;
}

interface DeliveryActions {
  setDeliveries: (deliveries: ClassroomProjectDeliveryT[]) => void;
  getAllDeliveriesByProjectId: (projectId: string) => Promise<boolean>;
  createDelivery: (
    deliveryData: Omit<ClassroomProjectDeliveryT, "id" | "created_at">
  ) => Promise<boolean>;
  updateDelivery: (
    id: string,
    deliveryData: Partial<ClassroomProjectDeliveryT>
  ) => Promise<boolean>;
  deleteDelivery: (id: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: DeliveryState = {
  deliveries: [],
  loading: false,
};

export const useDeliveryStore = create<DeliveryState & DeliveryActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setDeliveries: (deliveries) => set({ deliveries }),

      getAllDeliveriesByProjectId: async (projectId) => {
        set({ loading: true });
        try {
          if (!projectId) throw new Error("Project ID is required");
          const allDeliveries = await getAllDeliveriesByProjectId(projectId);
          if (!allDeliveries) throw new Error("No deliveries found");
          set({ deliveries: allDeliveries });
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar entregas. Tente novamente mais tarde.");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createDelivery: async (deliveryData) => {
        try {
          if (!deliveryData.project_id || !deliveryData.members.length) {
            throw new Error("Project ID and delivery content are required");
          }
          const deliveryCreated = await createClassroomProjectDelivery(
            deliveryData
          );
          if (!deliveryCreated) throw new Error("Delivery creation failed");
          set({ 
            deliveries: [...get().deliveries, deliveryCreated] 
          });
          toast.success("Entrega criada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao criar entrega. Tente novamente mais tarde.");
          return false;
        }
      },

      updateDelivery: async (id, deliveryData) => {
        try {
          if (!id || !deliveryData) {
            throw new Error("Delivery ID and update data are required");
          }
          const updatedDelivery = await updateClassroomProjectDeliveryById(
            id,
            deliveryData
          );
          if (!updatedDelivery) throw new Error("Delivery update failed");
          set({
            deliveries: get().deliveries.map((delivery) =>
              delivery.id === updatedDelivery.id ? updatedDelivery : delivery
            )
          });
          toast.success("Entrega atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating delivery:", error);
          toast.error("Erro ao atualizar entrega. Tente novamente mais tarde.");
          return false;
        }
      },

      deleteDelivery: async (id) => {
        try {
          if (!id) throw new Error("Delivery ID is required");
          const success = await deleteDeliveryById(id);
          if (!success) throw new Error("Delivery deletion failed");
          set({
            deliveries: get().deliveries.filter(
              (delivery) => delivery.id !== id
            )
          });
          toast.success("Entrega deletada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error deleting delivery:", error);
          toast.error("Erro ao deletar entrega. Tente novamente mais tarde.");
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "DeliveryStore" }
  )
);
