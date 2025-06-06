import {
  getZoomPastInstanceById,
  getAllZoomPastInstancesByClassroomId,
  updateZoomPastInstanceById,
  deleteZoomPastInstanceById,
  createZoomPastInstance,
} from "@/app/actions/classrooms/zoom/meetings-past-instancies";
import { ZoomMeetingPastInstancesType } from "@/types/zoom/meetings";
import { useState } from "react";
import { toast } from "sonner";

const useZoomPastInstancesStack = () => {
  const [pastInstances, setPastInstances] = useState<ZoomMeetingPastInstancesType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllZoomPastInstances = async (classroomId: string) => {
    try {
      setLoading(true);
      const response = await getAllZoomPastInstancesByClassroomId(classroomId);
      if (!response) throw "no past instances response";
      setPastInstances(response);
      return true;
    } catch (error) {
      console.error("Failed to fetch past instances:", error);
      toast.error("Erro ao buscar instâncias passadas!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetZoomPastInstanceById = async (id: string) => {
    try {
      setLoading(true);
      const response = await getZoomPastInstanceById(id);
      if (!response) throw "no past instance response";
      return response;
    } catch (error) {
      console.error("Failed to fetch past instance:", error);
      toast.error("Erro ao buscar instância passada!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZoomPastInstance = async (
    instanceData: Partial<ZoomMeetingPastInstancesType>
  ) => {
    try {
      if (!instanceData.uuid || !instanceData.classroom_id || !instanceData.account_id || !instanceData.meeting_id) {
        toast.error("Dados obrigatórios da instância estão faltando!");
        throw new Error("missing required past instance data");
      }

      const newInstance = await createZoomPastInstance({
        ...instanceData,
        synchronized_at: new Date().toISOString(),
      });

      if (!newInstance) throw new Error("no past instance create response");

      setPastInstances((instances) => [newInstance, ...instances]);
      toast.success("Instância passada criada com sucesso!");
      return newInstance.id as string;
    } catch (error) {
      console.error("Failed to create past instance:", error);
      toast.error("Erro ao criar nova instância passada!");
      return false;
    }
  };

  const handleUpdateZoomPastInstance = async (
    id: string,
    updates: Partial<ZoomMeetingPastInstancesType>
  ) => {
    try {
      if (!id || !updates) {
        throw new Error("id and updates fields are required");
      }
      const updatedInstance = await updateZoomPastInstanceById(id, updates);
      if (!updatedInstance) throw new Error("no update past instance response");

      setPastInstances((instances) =>
        instances.map((instance) =>
          instance.id === id ? updatedInstance : instance
        )
      );
      toast.success("Instância passada atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error("Failed to update past instance:", error);
      toast.error("Erro ao atualizar a instância passada!");
      return false;
    }
  };

  const handleDeleteZoomPastInstance = async (id: string) => {
    try {
      if (!id) throw new Error("past instance id is required to delete");
      setLoading(true);
      const response = await deleteZoomPastInstanceById(id);
      if (!response) throw new Error("no delete past instance response");

      setPastInstances((instances) =>
        instances.filter((instance) => instance.id !== id)
      );
      toast.success("Instância passada deletada com sucesso!");
      return true;
    } catch (error) {
      console.error("Failed to delete past instance:", error);
      toast.error("Erro ao deletar instância passada. Tente novamente mais tarde!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    pastInstances,
    setPastInstances,
    pastInstancesLoading: loading,
    handleGetAllZoomPastInstances,
    handleGetZoomPastInstanceById,
    handleCreateZoomPastInstance,
    handleUpdateZoomPastInstance,
    handleDeleteZoomPastInstance,
  };
};

export default useZoomPastInstancesStack;

export interface ZoomPastInstancesStackI {
  pastInstances: ZoomMeetingPastInstancesType[];
  pastInstancesLoading: boolean;
  handleGetAllZoomPastInstances: (classroomId: string) => Promise<boolean>;
  handleGetZoomPastInstanceById: (id: string) => Promise<ZoomMeetingPastInstancesType | boolean>;
  handleCreateZoomPastInstance: (
    instanceData: Partial<ZoomMeetingPastInstancesType>
  ) => Promise<string | false>;
  handleUpdateZoomPastInstance: (
    id: string,
    updates: Partial<ZoomMeetingPastInstancesType>
  ) => Promise<boolean>;
  handleDeleteZoomPastInstance: (id: string) => Promise<boolean>;
}