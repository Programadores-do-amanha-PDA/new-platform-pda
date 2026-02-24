import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/lib/toast";
import { ResumeT } from "@/types/resume";
import {
  createUserResume,
  getAllUserResume,
  getUserResumeByUserId,
  updateUserResumeById,
  deleteUserResumeById,
} from "@/features/jobs/actions/resume";
import { Profile } from "@/features/users/profile/types/profile";

interface ResumeState {
  resumes: ResumeT[];
  loading: boolean;
}

interface ResumeActions {
  setResumes: (resumes: ResumeT[]) => void;
  getAllResumes: () => Promise<boolean>;
  getResumeByUserId: (user: Profile) => Promise<boolean>;
  createResume: (
    resumeData: ResumeT,
    user: Profile
  ) => Promise<boolean>;
  updateResume: (id: string, resumeData: Partial<ResumeT>) => Promise<boolean>;
  deleteResume: (id: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: ResumeState = {
  resumes: [],
  loading: false,
};

export const useResumeStore = create<ResumeState & ResumeActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setResumes: (resumes) => set({ resumes }),

      getAllResumes: async () => {
        set({ loading: true });
        try {
          const response = await getAllUserResume();
          if (!response) throw "Failed to fetch resumes";
          set({ resumes: response });
          return true;
        } catch (error) {
          console.error("Error fetching resumes:", error);
          toast.error({
            title: "Erro ao carregar currículos",
            description: "Ocorreu um erro ao carregar os currículos. Tente novamente mais tarde!",
          });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getResumeByUserId: async (user) => {
        set({ loading: true });
        try {
          if (!user.id) throw "User ID is required";
          const response = await getUserResumeByUserId(user.id);
          if (!response) throw "Resume not found";
          set({ resumes: [response] });
          return true;
        } catch (error) {
          console.error("Error fetching user resume:", error);
          toast.error({
            title: "Erro ao buscar currículo",
            description: "Ocorreu um erro ao buscar o currículo do usuário. Tente novamente mais tarde!",
          });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createResume: async (resumeData, user) => {
        try {
          if (!user.id) throw "User ID is required";
          const response = await createUserResume({
            ...resumeData,
            user_id: user.id,
          });
          if (!response) throw "Failed to create resume";
          set({ resumes: [...get().resumes, response] });
          toast.success({
            title: "Currículo criado com sucesso",
            description: "O currículo foi criado com sucesso!",
          });
          return true;
        } catch (error) {
          console.error("Error creating resume:", error);
          toast.error({
            title: "Erro ao criar currículo",
            description: "Ocorreu um erro ao criar o currículo. Tente novamente mais tarde!",
          });
          return false;
        }
      },

      updateResume: async (id, resumeData) => {
        try {
          const response = await updateUserResumeById(id, {
            ...resumeData,
            updated_at: new Date(),
          });
          if (!response) throw "Failed to update resume";
          set({
            resumes: get().resumes.map((resume) =>
              resume.id === id ? { ...resume, ...response } : resume
            ),
          });
          toast.success({
            title: "Currículo atualizado com sucesso",
            description: "O currículo foi atualizado com sucesso!",
          });
          return true;
        } catch (error) {
          console.error("Error updating resume:", error);
          toast.error({
            title: "Erro ao atualizar currículo",
            description: "Ocorreu um erro ao atualizar o currículo. Tente novamente mais tarde!",
          });
          return false;
        }
      },

      deleteResume: async (id) => {
        try {
          const success = await deleteUserResumeById(id);
          if (!success) throw "Failed to delete resume";
          set({ resumes: get().resumes.filter((resume) => resume.id !== id) });
          toast.success({
            title: "Currículo deletado com sucesso",
            description: "O currículo foi deletado com sucesso!",
          });
          return true;
        } catch (error) {
          console.error("Error deleting resume:", error);
          toast.error({
            title: "Erro ao deletar currículo",
            description: "Ocorreu um erro ao deletar o currículo. Tente novamente mais tarde!",
          });
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ResumeStore" }
  )
);
