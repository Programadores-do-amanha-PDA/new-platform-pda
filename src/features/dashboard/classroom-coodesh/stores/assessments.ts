import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import {
  createCoodeshAssessment,
  getAllCoodeshAssessment,
  updateCoodeshAssessment,
  deleteCoodeshAssessment,
} from "@/app/actions/classrooms/coodesh/assessments";
import { ClassroomCoodeshAssessmentT } from "@/types";

interface CoodeshAssessmentState {
  assessments: ClassroomCoodeshAssessmentT[];
  loading: boolean;
}

interface CoodeshAssessmentActions {
  setAssessments: (assessments: ClassroomCoodeshAssessmentT[]) => void;
  getAllAssessmentsByClassroomId: (classroomId: string) => Promise<boolean>;
  createAssessment: (
    assessmentData: Partial<ClassroomCoodeshAssessmentT>
  ) => Promise<boolean>;
  updateAssessment: (
    assessment: ClassroomCoodeshAssessmentT,
    updatedData: Partial<ClassroomCoodeshAssessmentT>
  ) => Promise<boolean>;
  deleteAssessment: (assessmentId: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: CoodeshAssessmentState = {
  assessments: [],
  loading: false,
};

export const useCoodeshAssessmentStore = create<
  CoodeshAssessmentState & CoodeshAssessmentActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setAssessments: (assessments) => set({ assessments }),

      getAllAssessmentsByClassroomId: async (classroomId) => {
        set({ loading: true });
        try {
          if (!classroomId) throw new Error("required fields");

          const allAssessments = await getAllCoodeshAssessment(classroomId);

          if (!allAssessments)
            throw new Error("no assessment created successfully");

          set({ assessments: allAssessments });
          return true;
        } catch (error) {
          console.log(error);
          toast.error(
            "Erro ao buscar avaliações da sala de aula! Tente novamente mais tarde!"
          );
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createAssessment: async (assessmentData) => {
        try {
          if (!assessmentData.classroom_id || !assessmentData.assessment_id)
            throw new Error("required fields");

          const assessmentCreated = await createCoodeshAssessment(
            assessmentData
          );
          if (!assessmentCreated)
            throw new Error("no assessment created successfully");

          set({
            assessments: [...get().assessments, assessmentCreated],
          });
          toast.success("Avaliação anexada com sucesso!");
          return true;
        } catch (error) {
          console.log(error);
          toast.error(
            "Erro ao anexar a avaliação! Tente novamente mais tarde!"
          );
          return false;
        }
      },

      updateAssessment: async (assessment, updatedData) => {
        console.log("Updating assessment with data:", updatedData);

        try {
          if (!assessment.id || !updatedData) {
            throw new Error("No assessment ID or update data provided");
          }

          const updatedAssessment = await updateCoodeshAssessment(
            assessment.id,
            updatedData
          );

          if (!updatedAssessment) {
            throw new Error(
              "Failed to update assessment: No data returned from the API"
            );
          }

          set({
            assessments: get().assessments.map((item) =>
              item.id === updatedAssessment.id ? updatedAssessment : item
            ),
          });

          toast.success("Avaliação atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error updating assessment:", error);
          toast.error(
            "Erro ao atualizar a avaliação! Tente novamente mais tarde."
          );
          return false;
        }
      },

      deleteAssessment: async (assessmentId) => {
        try {
          if (!assessmentId) {
            throw new Error("Assessment ID is required");
          }

          const deleted = await deleteCoodeshAssessment(assessmentId);

          if (!deleted) {
            throw new Error("Failed to delete assessment");
          }

          set({
            assessments: get().assessments.filter(
              (item) => item.id !== assessmentId
            ),
          });

          toast.success("Avaliação removida com sucesso!");
          return true;
        } catch (error) {
          console.error("Error deleting assessment:", error);
          toast.error(
            "Erro ao remover a avaliação! Tente novamente mais tarde."
          );
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "CoodeshAssessmentStore" }
  )
);
