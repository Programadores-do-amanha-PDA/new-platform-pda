import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/lib/toast";

import { getAllProjectsByClassroomId, createClassroomProject, updateClassroomProjectById, deleteProjectById } from "../actions";
import { ClassroomProject } from "../types/projects/project";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "ClassroomProjectStore" });

interface ClassroomProjectStoreStateT {
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
                    log.error({ err: error, operation: "get_all_projects_by_classroom_id" }, "Error fetching projects");
                    toast.error({
                        title: "Erro ao carregar projetos",
                        description: "Ocorreu um erro ao carregar os projetos. Tente novamente mais tarde.",
                    });
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
                    toast.success({ title: "Projeto criado!", description: "O projeto foi criado com sucesso." });
                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "create_project" }, "Error creating project");
                    toast.error({
                        title: "Erro ao criar projeto",
                        description: "Ocorreu um erro ao criar o projeto. Tente novamente mais tarde.",
                    });
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
                    toast.success({ title: "Projeto atualizado!", description: "O projeto foi atualizado com sucesso." });
                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "update_project" }, "Error updating project");
                    toast.error({
                        title: "Erro ao atualizar projeto",
                        description: "Erro ao atualizar projeto. Tente novamente mais tarde.",
                    });
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
                    toast.success({ title: "Projeto deletado!", description: "O projeto foi deletado com sucesso." });
                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "delete_project" }, "Error deleting project");
                    toast.error({
                        title: "Erro ao deletar projeto",
                        description: "Ocorreu um erro ao deletar o projeto. Tente novamente mais tarde.",
                    });
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
