import {
  createClassroom,
  deleteClassroom,
  getAllClassrooms,
  updateClassroom,
} from "@/app/actions/classrooms";
import { ClassroomType } from "@/types/classrooms";
import { useState } from "react";
import { toast } from "sonner";

const ClassroomStack = () => {
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllClassrooms = async () => {
    try {
      setLoading(true);
      const classroomsResponse = await getAllClassrooms();
      if (!classroomsResponse) throw "no classrooms response";
      setClassrooms(classroomsResponse);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (
    classroomData: Partial<ClassroomType>
  ) => {
    try {
      if (
        !classroomData.name ||
        classroomData.name.trim().length === 0 ||
        classrooms.map((t) => t.name).includes(classroomData.name)
      ) {
        toast.error("Nome da turma é inválido ou já existe!");
        throw new Error("invalid classroom name");
      }

      if (!classroomData.period) {
        toast.error("Período da turma é inválido!");
        throw new Error("invalid classroom period");
      }

      const newClassroom = await createClassroom(classroomData);
      if (!newClassroom) throw new Error("no classroom create response");

      setClassrooms((classrooms) => [...classrooms, { ...newClassroom }]);
      toast.success(`Turma ${newClassroom.name} criada com sucesso!`);
      return newClassroom.id;
    } catch (error) {
      toast.error("Erro ao criar novo usuário!");
      console.log(error);
      return false;
    }
  };

  const handleUpdateClassroom = async (
    classroomId: string,
    updates: Partial<ClassroomType>
  ) => {
    try {
      if (!classroomId || !updates) {
        throw new Error("id and updates fields are required");
      }

      const classroomUpdated = await updateClassroom(classroomId, updates);
      if (!classroomUpdated) throw new Error("no update classroom response");

      setClassrooms((classrooms) =>
        classrooms.map((classroom) =>
          classroom.id === classroomId ? classroomUpdated : classroom
        )
      );
      toast.success("Turma atualizada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar a turma!");
      return false;
    }
  };

  const handleDeleteClassroom = async (classroomId: string) => {
    try {
      if (!classroomId) throw new Error("classroom id is required to delete");

      const response = await deleteClassroom(classroomId);
      if (!response) throw new Error("no delete classroom response");

      setClassrooms((classrooms) =>
        classrooms.filter((classroom) => classroom.id !== classroomId)
      );
      toast.success("Turma deletada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar turma. Tente novamente mais tarde!");
      return false;
    }
  };

  return {
    classrooms,
    setClassrooms,
    classroomsLoading: loading,
    handleGetAllClassrooms,
    handleCreateClassroom,
    handleUpdateClassroom,
    handleDeleteClassroom,
  };
};
export default ClassroomStack;

export interface ClassroomStackI {
  classrooms: ClassroomType[];
  handleGetAllClassrooms: () => Promise<boolean>;
  classroomsLoading: boolean;
  handleCreateClassroom: (
    classroomData: Partial<ClassroomType>
  ) => Promise<boolean | string>;
  handleUpdateClassroom: (
    classroomId: string,
    updates: Partial<ClassroomType>
  ) => Promise<boolean>;
  handleDeleteClassroom: (classroomId: string) => Promise<boolean>;
}
