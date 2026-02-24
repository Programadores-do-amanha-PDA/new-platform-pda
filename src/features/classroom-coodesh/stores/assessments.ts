import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/lib/toast";
import {
    getAllCoodeshAssessmentByClassroomId,
    createCoodeshAssessment,
    updateCoodeshAssessment,
    deleteCoodeshAssessment,
} from "../actions";
import { CoodeshAssessment } from "../types";
import { logger } from "@/lib/logger";

interface CoodeshAssessmentState {
    assessments: CoodeshAssessment[];
    loading: boolean;
}

interface CoodeshAssessmentActions {
    setAssessments: (assessments: CoodeshAssessment[]) => void;
    getAllAssessmentsByClassroomId: (classroomId: string) => Promise<boolean>;
    createAssessment: (assessmentData: Partial<CoodeshAssessment>) => Promise<boolean>;
    createManualAssessment: (classroomId: string, assessmentData: Partial<CoodeshAssessment>) => Promise<boolean>;
    updateAssessment: (assessment: CoodeshAssessment, updatedData: Partial<CoodeshAssessment>) => Promise<boolean>;
    deleteAssessment: (assessmentId: string) => Promise<boolean>;
    reset: () => void;
}

const initialState: CoodeshAssessmentState = {
    assessments: [],
    loading: false,
};

const log = logger.child({ module: "CoodeshAssessmentStore" });

export const useCoodeshAssessmentStore = create<CoodeshAssessmentState & CoodeshAssessmentActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setAssessments: (assessments) => set({ assessments }),

            getAllAssessmentsByClassroomId: async (classroomId) => {
                set({ loading: true });
                try {
                    if (!classroomId) throw new Error("required fields");

                    const allAssessments = await getAllCoodeshAssessmentByClassroomId({ classroomId });

                    if (!allAssessments) throw new Error("no assessment created successfully");

                    set({ assessments: allAssessments });
                    return true;
                } catch (error) {
                    log.error(error);
                    toast.error({
                        title: "Erro!",
                        description: "Ocorreu um erro ao buscar as avaliações. Tente novamente mais tarde!",
                    });
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createAssessment: async (assessmentData) => {
                try {
                    if (!assessmentData.classroom_id || !assessmentData.assessment_id) throw new Error("required fields");

                    const assessmentCreated = await toast.promise(createCoodeshAssessment(assessmentData), {
                        loading: { title: "Criando avaliação..." },
                        success: { title: "Sucesso!", description: "Avaliação criada com sucesso!" },
                        error: { title: "Erro!", description: "Erro ao criar avaliação! Tente novamente mais tarde!" },
                    });
                    if (!assessmentCreated) throw new Error("no assessment created successfully");

                    set({
                        assessments: [...get().assessments, assessmentCreated],
                    });
                    return true;
                } catch (error) {
                    log.error(error);
                    toast.error({
                        title: "Erro!",
                        description: "Erro ao anexar a avaliação! Tente novamente mais tarde!",
                    });
                    return false;
                }
            },

            createManualAssessment: async (classroomId, assessmentData) => {
                try {
                    if (!classroomId) throw new Error("classroom_id is required");

                    // Generate a unique assessment_id for manual assessments
                    const assessment_id = assessmentData.assessment_id || "";

                    const manualAssessmentData: Partial<CoodeshAssessment> = {
                        assessment_id,
                        classroom_id: classroomId,
                        name: assessmentData.name,
                        description: assessmentData.description || "",
                        default_locale: assessmentData.default_locale || "pt",
                        duration: assessmentData.duration,
                        duration_unit: assessmentData.duration_unit,
                        questions: [],
                        created_at: new Date().toISOString(),
                    };

                    const assessmentCreated = await toast.promise(createCoodeshAssessment(manualAssessmentData), {
                        loading: { title: "Criando avaliação manual..." },
                        success: { title: "Sucesso!", description: "Avaliação manual criada com sucesso!" },
                        error: { title: "Erro!", description: "Erro ao criar avaliação manual! Tente novamente mais tarde!" },
                    });

                    if (!assessmentCreated) throw new Error("no manual assessment created successfully");

                    set({
                        assessments: [...get().assessments, assessmentCreated],
                    });

                    return true;
                } catch (error) {
                    log.error(error);
                    toast.error({
                        title: "Erro!",
                        description: "Erro ao criar a avaliação! Tente novamente mais tarde!",
                    });
                    return false;
                }
            },

            updateAssessment: async (assessment, updatedData) => {
                try {
                    if (!assessment.id || !updatedData) {
                        throw new Error("No assessment ID or update data provided");
                    }

                    const updatedAssessment = await toast.promise(updateCoodeshAssessment(assessment.id, updatedData), {
                        loading: { title: "Atualizando avaliação..." },
                        success: { title: "Sucesso!", description: "Avaliação atualizada com sucesso!" },
                        error: { title: "Erro!", description: "Erro ao atualizar a avaliação! Tente novamente mais tarde!" },
                    });

                    if (!updatedAssessment) {
                        throw new Error("Failed to update assessment: No data returned from the API");
                    }

                    set({
                        assessments: get().assessments.map((item) =>
                            item.id === updatedAssessment.id ? updatedAssessment : item,
                        ),
                    });

                    toast.success({
                        title: "Sucesso!",
                        description: "Avaliação atualizada com sucesso!",
                    });
                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "updateAssessment" }, "Error updating assessment");
                    toast.error({
                        title: "Erro!",
                        description: "Erro ao atualizar a avaliação! Tente novamente mais tarde.",
                    });
                    return false;
                }
            },

            deleteAssessment: async (assessmentId) => {
                try {
                    if (!assessmentId) {
                        throw new Error("CoodeshAssessmentPayload ID is required");
                    }

                    const deleted = await toast.promise(deleteCoodeshAssessment(assessmentId), {
                        loading: { title: "Removendo avaliação..." },
                        success: { title: "Sucesso!", description: "Avaliação removida com sucesso!" },
                        error: { title: "Erro!", description: "Erro ao remover a avaliação! Tente novamente mais tarde!" },
                    });

                    if (!deleted) {
                        throw new Error("Failed to delete assessment");
                    }

                    set({
                        assessments: get().assessments.filter((item) => item.id !== assessmentId),
                    });

                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "deleteAssessment" }, "Error deleting assessment");
                    toast.error({
                        title: "Erro!",
                        description: "Erro ao remover a avaliação! Tente novamente mais tarde.",
                    });
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "CoodeshAssessmentStore" },
    ),
);
