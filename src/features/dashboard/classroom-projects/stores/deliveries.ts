import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import {
  createClassroomProjectDelivery,
  getAllDeliveriesByProjectId,
  getAllDeliveriesByClassroomId,
  updateClassroomProjectDeliveryById,
  deleteDeliveryById,
} from "@/actions/classrooms/projects/deliveries";
import { ClassroomProjectDeliveryT } from "../types";

interface DeliveryState {
  deliveries: Record<string, ClassroomProjectDeliveryT[]>;
  loading: boolean;
}

interface DeliveryActions {
  setDeliveries: (
    classroomId: string,
    deliveries: ClassroomProjectDeliveryT[]
  ) => void;
  getDeliveriesForClassroom: (
    classroomId: string
  ) => ClassroomProjectDeliveryT[];
  getAllDeliveriesByProjectId: (projectId: string) => Promise<boolean>;
  getAllDeliveriesByClassroomId: (classroomId: string) => Promise<boolean>;
  createDelivery: (
    deliveryData: Omit<Partial<ClassroomProjectDeliveryT>, "id" | "created_at">,
    classroomId: string
  ) => Promise<boolean>;
  updateDelivery: (
    id: string,
    deliveryData: Partial<ClassroomProjectDeliveryT>,
    classroomId: string
  ) => Promise<boolean>;
  deleteDelivery: (id: string, classroomId: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: DeliveryState = {
  deliveries: {},
  loading: false,
};

export const useDeliveryStore = create<DeliveryState & DeliveryActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setDeliveries: (classroomId, deliveries) => {
        const currentDeliveries = get().deliveries[classroomId] || [];
        const existingIds = new Set(currentDeliveries.map((d) => d.id));
        const newDeliveries = deliveries.filter((d) => !existingIds.has(d.id));

        set((state) => ({
          deliveries: {
            ...state.deliveries,
            [classroomId]: [...currentDeliveries, ...newDeliveries],
          },
        }));
      },

      getDeliveriesForClassroom: (classroomId) => {
        return get().deliveries[classroomId] || [];
      },

      getAllDeliveriesByProjectId: async (projectId) => {
        set({ loading: true });
        try {
          if (!projectId) throw new Error("Project ID is required");
          const allDeliveries = await getAllDeliveriesByProjectId(projectId);
          if (!allDeliveries) throw new Error("No deliveries found");

          // Group deliveries by classroom_id and prevent duplicates
          const currentDeliveries = get().deliveries;
          const deliveriesByClassroom = allDeliveries.reduce(
            (acc, delivery) => {
              const classroomId = delivery.classroom_id;
              if (!acc[classroomId]) {
                acc[classroomId] = [];
              }

              // Check if delivery already exists in current state
              const existingDeliveries = currentDeliveries[classroomId] || [];
              const existingIds = new Set(existingDeliveries.map((d) => d.id));

              if (!existingIds.has(delivery.id)) {
                acc[classroomId].push(delivery);
              }
              return acc;
            },
            {} as Record<string, ClassroomProjectDeliveryT[]>
          );

          // Merge with existing deliveries
          set((state) => ({
            deliveries: Object.keys(deliveriesByClassroom).reduce(
              (acc, classroomId) => {
                const existing = state.deliveries[classroomId] || [];
                acc[classroomId] = [
                  ...existing,
                  ...deliveriesByClassroom[classroomId],
                ];
                return acc;
              },
              { ...state.deliveries } as Record<
                string,
                ClassroomProjectDeliveryT[]
              >
            ),
          }));
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar entregas. Tente novamente mais tarde.");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getAllDeliveriesByClassroomId: async (classroomId) => {
        set({ loading: true });
        try {
          if (!classroomId) throw new Error("Classroom ID is required");
          const allDeliveries = await getAllDeliveriesByClassroomId(
            classroomId
          );
          if (!allDeliveries) throw new Error("No deliveries found");

          const currentDeliveries = get().deliveries[classroomId] || [];
          const existingIds = new Set(currentDeliveries.map((d) => d.id));
          const newDeliveries = allDeliveries.filter(
            (d) => !existingIds.has(d.id)
          );

          set((state) => ({
            deliveries: {
              ...state.deliveries,
              [classroomId]: [...currentDeliveries, ...newDeliveries],
            },
          }));
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar entregas. Tente novamente mais tarde.");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createDelivery: async (deliveryData, classroomId) => {
        try {
          if (!deliveryData.project_id || !deliveryData.user_id) {
            throw new Error("Project ID and user ID are required");
          }
          if (!classroomId) throw new Error("Classroom ID is required");

          const deliveryCreated = await createClassroomProjectDelivery({
            ...deliveryData,
            classroom_id: classroomId,
          });
          if (!deliveryCreated) throw new Error("Delivery creation failed");

          const currentDeliveries = get().deliveries[classroomId] || [];
          const existingIds = new Set(currentDeliveries.map((d) => d.id));

          // Only add if delivery doesn't already exist
          if (!existingIds.has(deliveryCreated.id)) {
            set((state) => ({
              deliveries: {
                ...state.deliveries,
                [classroomId]: [...currentDeliveries, deliveryCreated],
              },
            }));
          }
          toast.success("Entrega criada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao criar entrega. Tente novamente mais tarde.");
          return false;
        }
      },

      updateDelivery: async (id, deliveryData, classroomId) => {
        try {
          if (!id || !deliveryData) {
            throw new Error("Delivery ID and update data are required");
          }
          if (!classroomId) throw new Error("Classroom ID is required");

          const updatedDelivery = await updateClassroomProjectDeliveryById(id, {
            ...deliveryData,
            classroom_id: classroomId,
          });
          if (!updatedDelivery) throw new Error("Delivery update failed");

          const currentDeliveries = get().deliveries[classroomId] || [];
          set((state) => ({
            deliveries: {
              ...state.deliveries,
              [classroomId]: currentDeliveries.map((delivery) =>
                delivery.id === updatedDelivery.id ? updatedDelivery : delivery
              ),
            },
          }));
          toast.success("Entrega atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating delivery:", error);
          toast.error("Erro ao atualizar entrega. Tente novamente mais tarde.");
          return false;
        }
      },

      deleteDelivery: async (id, classroomId) => {
        try {
          if (!id) throw new Error("Delivery ID is required");
          if (!classroomId) throw new Error("Classroom ID is required");

          const success = await deleteDeliveryById(id);
          if (!success) throw new Error("Delivery deletion failed");

          const currentDeliveries = get().deliveries[classroomId] || [];
          set((state) => ({
            deliveries: {
              ...state.deliveries,
              [classroomId]: currentDeliveries.filter(
                (delivery) => delivery.id !== id
              ),
            },
          }));
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
