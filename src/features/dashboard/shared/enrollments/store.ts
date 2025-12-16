import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { createEnrollments, updateEnrollment, removeEnrollments } from "./actions";
import { Enrollment } from "./types";

interface EnrollmentsState {
    enrollments: Map<string, Enrollment[]>;
    loading: boolean;
}

interface EnrollmentsActions {
    /**
     * Define as inscrições de uma turma específica.
     * @param classroomId ID da turma.
     * @param enrollments Array de inscrições.
     */
    setEnrollmentsByClassroom: ({
        classroomId,
        enrollments,
    }: {
        readonly classroomId: string;
        readonly enrollments: Enrollment[];
    }) => void;

    /**
     * Cria novas inscrições.
     * @param enrollments Array de inscrições a criar.
     * @returns Inscrição atualizada se sucesso, null caso contrário.
     */
    createNewEnrollments: ({
        enrollments,
    }: {
        enrollments: readonly Omit<Enrollment, "short_id" | "mode" | "created_at">[];
    }) => Promise<boolean>;

    /**
     * Atualiza uma inscrição específica.
     * @param shortId ID curto único da inscrição.
     * @param updates Objeto com os campos a serem atualizados (mode, etc).
     * @returns true se sucesso, false caso contrário.
     */
    updateEnrollmentByShortIdAndClassroomId: ({
        shortId,
        updates,
    }: {
        readonly shortId: string;
        readonly updates: Partial<Omit<Enrollment, "short_id" | "created_at" | "user_id" | "classroom_id">>;
    }) => Promise<boolean>;

    /**
     * Remove inscrições de um usuário em turmas específicas.
     * @param userId ID do usuário.
     * @param classroomIds Array de IDs das turmas.
     * @returns true se sucesso, false caso contrário.
     */
    removeEnrollmentsByUserAndClassrooms: ({
        userId,
        classroomIds,
    }: {
        readonly userId: string;
        classroomIds: readonly string[];
    }) => Promise<boolean>;

    reset: () => void;
}

const initialState: EnrollmentsState = {
    enrollments: new Map(),
    loading: false,
};

export const useEnrollmentsStore = create<EnrollmentsState & EnrollmentsActions>()(
    devtools(
        (set) => ({
            ...initialState,

            setEnrollmentsByClassroom: ({ classroomId, enrollments }) => {
                if (!enrollments.length || !classroomId) return;

                set((state) => {
                    const updatedEnrollments = new Map(state.enrollments);
                    updatedEnrollments.set(classroomId, enrollments);
                    return { enrollments: updatedEnrollments };
                });
            },

            createNewEnrollments: async ({ enrollments }) => {
                try {
                    if (!enrollments.length) {
                        toast.error("Nenhum usuário selecionado para vincular à turma!");
                        throw new Error("empty enrollments array");
                    }

                    const response = await createEnrollments({ enrollments: Array.from(enrollments) });
                    if (!response) throw new Error("No create enrollments response");

                    // Agrupar inscrições por turma e atualizar estado
                    set((state) => {
                        const updatedEnrollments = new Map(state.enrollments);

                        response.forEach((enrollment) => {
                            const classroomId = enrollment.classroom_id;
                            const existing = updatedEnrollments.get(classroomId) || [];
                            updatedEnrollments.set(classroomId, [...existing, enrollment]);
                        });

                        return { enrollments: updatedEnrollments };
                    });

                    toast.success(`${response.length} vínculo(s) criado(s) com sucesso!`);
                    return true;
                } catch (error) {
                    toast.error("Erro ao vincular usuários à turma!");
                    console.error(error);
                    return false;
                }
            },

            updateEnrollmentByShortIdAndClassroomId: async ({
                shortId,
                classroomId,
                updates,
            }: {
                readonly shortId: string;
                readonly classroomId: string;
                readonly updates: Partial<Omit<Enrollment, "short_id" | "created_at" | "user_id" | "classroom_id">>;
            }) => {
                try {
                    if (!shortId || !classroomId || !Object.keys(updates).length) {
                        throw new Error("short_id, classroomId and updates are required");
                    }

                    const response = await updateEnrollment({ shortId, classroomId, updates });
                    if (!response) throw new Error("no update enrollment response");

                    // Atualizar apenas a inscrição específica na turma especificada
                    set((state) => {
                        const updatedEnrollments = new Map(state.enrollments);
                        const classroomEnrollments = updatedEnrollments.get(classroomId) || [];

                        const updated = classroomEnrollments.map((enrollment) =>
                            enrollment.short_id === shortId ? { ...enrollment, ...updates } : enrollment,
                        );

                        updatedEnrollments.set(classroomId, updated);
                        return { enrollments: updatedEnrollments };
                    });

                    toast.success("Inscrição atualizada com sucesso!");
                    return true;
                } catch (error) {
                    toast.error("Erro ao atualizar inscrição!");
                    console.error(error);
                    return false;
                }
            },

            removeEnrollmentsByUserAndClassrooms: async ({ userId, classroomIds }) => {
                try {
                    if (!userId || !classroomIds.length) {
                        throw new Error("user id and classroom ids are required");
                    }

                    const response = await removeEnrollments({ userId, classroomIds: Array.from(classroomIds) });
                    if (!response) throw new Error("no remove enrollments response");

                    // Remove inscrições das turmas afetadas
                    set((state) => {
                        const updatedEnrollments = new Map(state.enrollments);

                        classroomIds.forEach((classroomId) => {
                            const existing = updatedEnrollments.get(classroomId) || [];
                            const filtered = existing.filter((e) => e.user_id !== userId);
                            updatedEnrollments.set(classroomId, filtered);
                        });

                        return { enrollments: updatedEnrollments };
                    });

                    toast.success("Vínculo usuário-turma removido com sucesso!");
                    return true;
                } catch (error) {
                    toast.error("Erro ao remover vínculo usuário-turma!");
                    console.error(error);
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "EnrollmentsStore" },
    ),
);
