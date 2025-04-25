"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  createClassroomProjectDelivery,
  getAllDeliveriesByProjectId,
  updateClassroomProjectDeliveryById,
  deleteDeliveryById,
} from "@/app/actions/classrooms/projects/deliveries";
import { ClassroomProjectDeliveryT } from "@/types/projects/delivery";

const useClassroomProjectDeliveries = () => {
  const [deliveries, setDeliveries] = useState<ClassroomProjectDeliveryT[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllDeliveriesByProjectId = async (projectId: string) => {
    setLoading(true);
    try {
      if (!projectId) throw new Error("Project ID is required");
      const allDeliveries = await getAllDeliveriesByProjectId(projectId);
      if (!allDeliveries) throw new Error("No deliveries found");
      setDeliveries(allDeliveries);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar entregas. Tente novamente mais tarde.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroomProjectDelivery = async (
    deliveryData: Omit<ClassroomProjectDeliveryT, "id" | "created_at">
  ) => {
    try {
      if (!deliveryData.project_id || !deliveryData.members.length) {
        throw new Error("Project ID and delivery content are required");
      }
      const deliveryCreated = await createClassroomProjectDelivery(
        deliveryData
      );
      if (!deliveryCreated) throw new Error("Delivery creation failed");
      setDeliveries((prevDeliveries) => [...prevDeliveries, deliveryCreated]);
      toast.success("Entrega criada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar entrega. Tente novamente mais tarde.");
      return false;
    }
  };

  const handleUpdateClassroomProjectDelivery = async (
    id: string,
    deliveryData: Partial<ClassroomProjectDeliveryT>
  ) => {
    try {
      if (!id || !deliveryData) {
        throw new Error("Delivery ID and update data are required");
      }
      const updatedDelivery = await updateClassroomProjectDeliveryById(
        id,
        deliveryData
      );
      if (!updatedDelivery) throw new Error("Delivery update failed");
      setDeliveries((prevDeliveries) =>
        prevDeliveries.map((delivery) =>
          delivery.id === updatedDelivery.id ? updatedDelivery : delivery
        )
      );
      toast.success("Entrega atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error updating delivery:", error);
      toast.error("Erro ao atualizar entrega. Tente novamente mais tarde.");
      return false;
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    try {
      if (!id) throw new Error("Delivery ID is required");
      const success = await deleteDeliveryById(id);
      if (!success) throw new Error("Delivery deletion failed");
      setDeliveries((prevDeliveries) =>
        prevDeliveries.filter((delivery) => delivery.id !== id)
      );
      toast.success("Entrega deletada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error deleting delivery:", error);
      toast.error("Erro ao deletar entrega. Tente novamente mais tarde.");
      return false;
    }
  };

  return {
    deliveries,
    deliveriesLoading: loading,
    handleGetAllDeliveriesByProjectId,
    handleCreateClassroomProjectDelivery,
    handleUpdateClassroomProjectDelivery,
    handleDeleteDelivery,
  };
};

export default useClassroomProjectDeliveries;

export interface ClassroomProjectDeliveriesI {
  deliveries: ClassroomProjectDeliveryT[];
  deliveriesLoading: boolean;
  handleGetAllDeliveriesByProjectId: (projectId: string) => Promise<boolean>;
  handleCreateClassroomProjectDelivery: (
    deliveryData: Omit<ClassroomProjectDeliveryT, "id" | "created_at">
  ) => Promise<boolean>;
  handleUpdateClassroomProjectDelivery: (
    id: string,
    deliveryData: Partial<ClassroomProjectDeliveryT>
  ) => Promise<boolean>;
  handleDeleteDelivery: (id: string) => Promise<boolean>;
}
