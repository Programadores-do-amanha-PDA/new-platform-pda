import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import {
    getAllCorrectionsByProjectId,
    getAllCorrectionsByDeliveryId,
    getAllCorrectionsByClassroomId,
    createClassroomProjectCorrection,
    updateClassroomProjectCorrectionById,
    deleteCorrectionById,
} from "../actions/corrections";
import { ClassroomProjectCorrection } from "../types/corrections/corrections";

interface CorrectionState {
    corrections: Record<string, ClassroomProjectCorrection[]>;
    loading: boolean;
}

interface CorrectionActions {
    setCorrections: (classroomId: string, corrections: ClassroomProjectCorrection[]) => void;
    getCorrectionsForClassroom: (classroomId: string) => ClassroomProjectCorrection[];
    getAllCorrectionsByProjectId: (projectId: string) => Promise<boolean>;
    getAllCorrectionsByDeliveryId: (deliveryId: string, classroomId: string) => Promise<boolean>;
    getAllCorrectionsByClassroomId: (classroomId: string) => Promise<boolean>;
    createCorrection: (
        correctionData: Omit<Partial<ClassroomProjectCorrection>, "id" | "created_at">,
        classroomId: string,
    ) => Promise<boolean>;
    updateCorrection: (
        id: string,
        correctionData: Partial<ClassroomProjectCorrection>,
        classroomId: string,
    ) => Promise<boolean>;
    deleteCorrection: (id: string, classroomId: string) => Promise<boolean>;
    reset: () => void;
}

const initialState: CorrectionState = {
    corrections: {},
    loading: false,
};

export const useClassroomProjectCorrectionsStore = create<CorrectionState & CorrectionActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setCorrections: (classroomId, corrections) => {
                const currentCorrections = get().corrections[classroomId] || [];
                const existingIds = new Set(currentCorrections.map((c) => c.id));
                const newCorrections = corrections.filter((c) => !existingIds.has(c.id));

                set((state) => ({
                    corrections: {
                        ...state.corrections,
                        [classroomId]: [...currentCorrections, ...newCorrections],
                    },
                }));
            },

            getCorrectionsForClassroom: (classroomId) => {
                return get().corrections[classroomId] || [];
            },

            getAllCorrectionsByProjectId: async (projectId) => {
                set({ loading: true });
                try {
                    if (!projectId) throw new Error("Project ID is required");
                    const allCorrections = await getAllCorrectionsByProjectId(projectId);
                    if (!allCorrections) throw new Error("No corrections found");

                    // Group corrections by classroom_id and prevent duplicates
                    const currentCorrections = get().corrections;
                    const correctionsByClassroom = allCorrections.reduce(
                        (acc, correction) => {
                            const classroomId = correction.classroom_id;
                            if (!acc[classroomId]) {
                                acc[classroomId] = [];
                            }

                            // Check if correction already exists in current state
                            const existingCorrections = currentCorrections[classroomId] || [];
                            const existingIds = new Set(existingCorrections.map((c) => c.id));

                            if (!existingIds.has(correction.id)) {
                                acc[classroomId].push(correction);
                            }
                            return acc;
                        },
                        {} as Record<string, ClassroomProjectCorrection[]>,
                    );

                    // Merge with existing corrections
                    set((state) => ({
                        corrections: Object.keys(correctionsByClassroom).reduce(
                            (acc, classroomId) => {
                                const existing = state.corrections[classroomId] || [];
                                acc[classroomId] = [...existing, ...correctionsByClassroom[classroomId]];
                                return acc;
                            },
                            { ...state.corrections } as Record<string, ClassroomProjectCorrection[]>,
                        ),
                    }));
                    return true;
                } catch (error) {
                    console.error(error);
                    toast.error("Erro ao carregar correções. Tente novamente mais tarde.");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getAllCorrectionsByDeliveryId: async (deliveryId, classroomId) => {
                set({ loading: true });
                try {
                    if (!deliveryId) throw new Error("Delivery ID is required");
                    if (!classroomId) throw new Error("Classroom ID is required");

                    const allCorrections = await getAllCorrectionsByDeliveryId(deliveryId);
                    if (!allCorrections) throw new Error("No corrections found");

                    const currentCorrections = get().corrections[classroomId] || [];
                    const existingIds = new Set(currentCorrections.map((c) => c.id));
                    const newCorrections = allCorrections.filter((c) => !existingIds.has(c.id));

                    set((state) => ({
                        corrections: {
                            ...state.corrections,
                            [classroomId]: [...currentCorrections, ...newCorrections],
                        },
                    }));
                    return true;
                } catch (error) {
                    console.error(error);
                    toast.error("Erro ao carregar correções. Tente novamente mais tarde.");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getAllCorrectionsByClassroomId: async (classroomId) => {
                set({ loading: true });
                try {
                    if (!classroomId) throw new Error("Classroom ID is required");
                    const allCorrections = await getAllCorrectionsByClassroomId(classroomId);
                    if (!allCorrections) throw new Error("No corrections found");

                    const currentCorrections = get().corrections[classroomId] || [];
                    const existingIds = new Set(currentCorrections.map((c) => c.id));
                    const newCorrections = allCorrections.filter((c) => !existingIds.has(c.id));

                    set((state) => ({
                        corrections: {
                            ...state.corrections,
                            [classroomId]: [...currentCorrections, ...newCorrections],
                        },
                    }));
                    return true;
                } catch (error) {
                    console.error(error);
                    toast.error("Erro ao carregar correções. Tente novamente mais tarde.");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createCorrection: async (correctionData, classroomId) => {
                try {
                    if (!correctionData.project_id || !correctionData.delivery_id) {
                        throw new Error("Project ID and delivery ID are required");
                    }
                    if (!classroomId) throw new Error("Classroom ID is required");

                    const correctionCreated = await createClassroomProjectCorrection(correctionData);
                    if (!correctionCreated) throw new Error("Correction creation failed");

                    const currentCorrections = get().corrections[classroomId] || [];
                    const existingIds = new Set(currentCorrections.map((c) => c.id));

                    // Only add if correction doesn't already exist
                    if (!existingIds.has(correctionCreated.id)) {
                        set((state) => ({
                            corrections: {
                                ...state.corrections,
                                [classroomId]: [...currentCorrections, correctionCreated],
                            },
                        }));
                    }
                    toast.success("Correção criada com sucesso!");
                    return true;
                } catch (error) {
                    console.error(error);
                    toast.error("Erro ao criar correção. Tente novamente mais tarde.");
                    return false;
                }
            },

            updateCorrection: async (id, correctionData, classroomId) => {
                try {
                    if (!id || !correctionData) {
                        throw new Error("Correction ID and update data are required");
                    }
                    if (!classroomId) throw new Error("Classroom ID is required");

                    const updatedCorrection = await updateClassroomProjectCorrectionById(id, correctionData);
                    if (!updatedCorrection) throw new Error("Correction update failed");

                    const currentCorrections = get().corrections[classroomId] || [];
                    set((state) => ({
                        corrections: {
                            ...state.corrections,
                            [classroomId]: currentCorrections.map((correction) =>
                                correction.id === updatedCorrection.id ? updatedCorrection : correction,
                            ),
                        },
                    }));
                    toast.success("Correção atualizada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error updating correction:", error);
                    toast.error("Erro ao atualizar correção. Tente novamente mais tarde.");
                    return false;
                }
            },

            deleteCorrection: async (id, classroomId) => {
                try {
                    if (!id) throw new Error("Correction ID is required");
                    if (!classroomId) throw new Error("Classroom ID is required");

                    const success = await deleteCorrectionById(id);
                    if (!success) throw new Error("Correction deletion failed");

                    const currentCorrections = get().corrections[classroomId] || [];
                    set((state) => ({
                        corrections: {
                            ...state.corrections,
                            [classroomId]: currentCorrections.filter((correction) => correction.id !== id),
                        },
                    }));
                    toast.success("Correção deletada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error deleting correction:", error);
                    toast.error("Erro ao deletar correção. Tente novamente mais tarde.");
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "CorrectionStore" },
    ),
);
