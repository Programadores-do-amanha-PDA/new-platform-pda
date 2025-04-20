"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  createClassroomProject,
  getAllProjectsByClassroomId,
  updateClassroomProjectById,
  deleteProjectById,
} from "@/app/actions/classrooms/projects";
import { ClassroomProjectT } from "@/types/projects/project";

const useClassroomProjects = () => {
  const [projects, setProjects] = useState<ClassroomProjectT[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllProjectsByClassroomId = async (classroomId: string) => {
    setLoading(true);
    try {
      if (!classroomId) throw new Error("Classroom ID is required");
      const allProjects = await getAllProjectsByClassroomId(classroomId);
      if (!allProjects) throw new Error("No projects found");
      setProjects(allProjects);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar projetos. Tente novamente mais tarde.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroomProject = async (
    projectData: Omit<ClassroomProjectT, "id" | "created_at">
  ) => {
    try {
      if (!projectData.classroom_id || !projectData.title) {
        throw new Error("Classroom ID and title are required");
      }
      const projectCreated = await createClassroomProject(projectData);
      if (!projectCreated) throw new Error("Project creation failed");
      setProjects((prevProjects) => [...prevProjects, projectCreated]);
      toast.success("Projeto criado com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar projeto. Tente novamente mais tarde.");
      return false;
    }
  };

  const handleUpdateClassroomProject = async (
    id: string,
    projectData: Partial<ClassroomProjectT>
  ) => {
    try {
      if (!id || !projectData) {
        throw new Error("Project ID and update data are required");
      }
      const updatedProject = await updateClassroomProjectById(id, projectData);
      if (!updatedProject) throw new Error("Project update failed");
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      );
      toast.success("Projeto atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Erro atualizar projeto. Tente novamente mais tarde.");
      return false;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      if (!id) throw new Error("Project ID is required");
      const success = await deleteProjectById(id);
      if (!success) throw new Error("Project deletion failed");
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== id)
      );
      toast.success("Projeto deletado com sucesso!");
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Erro ao deletar projeto. Tente novamente mais tarde.");
      return false;
    }
  };

  return {
    projects,
    projectsLoading: loading,
    handleGetAllProjectsByClassroomId,
    handleCreateClassroomProject,
    handleUpdateClassroomProject,
    handleDeleteProject,
  };
};

export default useClassroomProjects;

export interface ClassroomProjectsI {
  projects: ClassroomProjectT[];
  projectsLoading: boolean;
  handleGetAllProjectsByClassroomId: (classroomId: string) => Promise<boolean>;
  handleCreateClassroomProject: (
    projectData: Omit<ClassroomProjectT, "id" | "created_at">
  ) => Promise<boolean>;
  handleUpdateClassroomProject: (
    id: string,
    projectData: Partial<ClassroomProjectT>
  ) => Promise<boolean>;
  handleDeleteProject: (id: string) => Promise<boolean>;
}
