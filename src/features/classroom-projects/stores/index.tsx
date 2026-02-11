import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { getAllProjectsByClassroomId, createClassroomProject, updateClassroomProjectById, deleteProjectById } from "../actions";
import { ClassroomProject } from "../types/projects/project";

export interface ClassroomProjectStoreStateT {
    projects: ClassroomProject[];
    loading: boolean;
}

interface ClassroomProjectActions {
    setProjects: (projects: ClassroomProject[]) => void;
    getAllProjectsByClassroomId: (classroomId: string) => Promise<boolean>;
    createProject: (projectData: Omit<ClassroomProject, "id" | "created_at">) => Promise<boolean>;
    updateProject: (id: string, projectData: Partial<ClassroomProject>) => Promise<boolean>;
    deleteProject: (id: string) => Promise<boolean>;
    reset: () => void;
}

const initialState: ClassroomProjectStoreStateT = {
    projects: [],
    loading: false,
};

export const useClassroomProjectStore = create<ClassroomProjectStoreStateT & ClassroomProjectActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setProjects: (projects) => set({ projects }),

            getAllProjectsByClassroomId: async (classroomId) => {
                set({ loading: true });
                try {
                    if (!classroomId) throw new Error("Classroom ID is required");
                    const allProjects = await getAllProjectsByClassroomId(classroomId);
                    if (!allProjects) throw new Error("No projects found");
                    set({ projects: allProjects });
                    return true;
                } catch (error) {
                    console.error(error);
                    toast.error("Erro ao carregar projetos. Tente novamente mais tarde.");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createProject: async (projectData) => {
                try {
                    if (!projectData.classroom_id || !projectData.title) {
                        throw new Error("Classroom ID and title are required");
                    }
                    const projectCreated = await createClassroomProject(projectData);
                    if (!projectCreated) throw new Error("Project creation failed");
                    set({
                        projects: [...get().projects, projectCreated],
                    });
                    toast.success("Projeto criado com sucesso!");
                    return true;
                } catch (error) {
                    console.error(error);
                    toast.error("Erro ao criar projeto. Tente novamente mais tarde.");
                    return false;
                }
            },

            updateProject: async (id, projectData) => {
                try {
                    if (!id || !projectData) {
                        throw new Error("Project ID and update data are required");
                    }
                    const updatedProject = await updateClassroomProjectById(id, projectData);
                    if (!updatedProject) throw new Error("Project update failed");
                    set({
                        projects: get().projects.map((project) =>
                            project.id === updatedProject.id ? updatedProject : project,
                        ),
                    });
                    toast.success("Projeto atualizado com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error updating project:", error);
                    toast.error("Erro ao atualizar projeto. Tente novamente mais tarde.");
                    return false;
                }
            },

            deleteProject: async (id) => {
                try {
                    if (!id) throw new Error("Project ID is required");
                    const success = await deleteProjectById(id);
                    if (!success) throw new Error("Project deletion failed");
                    set({
                        projects: get().projects.filter((project) => project.id !== id),
                    });
                    toast.success("Projeto deletado com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error deleting project:", error);
                    toast.error("Erro ao deletar projeto. Tente novamente mais tarde.");
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "ProjectStore" },
    ),
);
