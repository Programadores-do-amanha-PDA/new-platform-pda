import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import {
    createEnrollments,
    updateEnrollment,
    removeEnrollments,
    getAllEnrollments,
    getEnrollmentsByClassroomId,
    getEnrollmentsByUserId,
} from "./actions";
import { Enrollment } from "./types";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "EnrollmentsStore" });

interface EnrollmentsState {
    enrollments: Map<string, Enrollment[]>;
    loading: boolean;
}

interface EnrollmentsActions {
    /**
     * Busca todas as inscrições.
     * @returns Array de inscrições ou null em caso de erro.
     */
    fetchAllEnrollments: () => Promise<boolean>;

    /**
     * Busca inscrições de uma turma específica.
     * @param classroomId ID da turma.
     * @returns true se sucesso, false caso contrário.
     */
    fetchEnrollmentsByClassroomId: (classroomId: string) => Promise<boolean>;

    /**
     * Busca inscrições de um usuário específico.
     * @param userId ID do usuário.
     * @returns true se sucesso, false caso contrário.
     */
    fetchEnrollmentsByUserId: (userId: string) => Promise<boolean>;

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
        classroomId,
        updates,
    }: {
        readonly shortId: string;
        readonly classroomId: string;
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

            fetchAllEnrollments: async () => {
                try {
                    set({ loading: true });

                    const response = await getAllEnrollments();
                    if (!response) throw new Error("no get all enrollments response");

                    // Agrupar inscrições por turma
                    set((state) => {
                        const updatedEnrollments = new Map(state.enrollments);

                        response.forEach((enrollment) => {
                            const classroomId = enrollment.classroom_id;
                            updatedEnrollments.set(classroomId, [...(updatedEnrollments.get(classroomId) || []), enrollment]);
                        });

                        return { enrollments: updatedEnrollments };
                    });

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn({ err: error, operation: "fetchAllEnrollments" }, "Error fetching all enrollments");
                    }
                    toast.error("Erro ao buscar inscrições!");

                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            fetchEnrollmentsByClassroomId: async (classroomId: string) => {
                try {
                    if (!classroomId) {
                        throw new Error("classroom_id is required");
                    }

                    set({ loading: true });

                    const response = await getEnrollmentsByClassroomId({ classroom_id: classroomId });
                    if (!response) throw new Error("no get enrollments by classroom response");

                    set((state) => {
                        const updatedEnrollments = new Map(state.enrollments);
                        updatedEnrollments.set(classroomId, response);
                        return { enrollments: updatedEnrollments };
                    });

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn(
                            { err: error, classroomId, operation: "fetchEnrollmentsByClassroomId" },
                            "Error fetching enrollments by classroom id",
                        );
                    }
                    toast.error("Erro ao buscar inscrições da turma!");

                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            fetchEnrollmentsByUserId: async (userId: string) => {
                try {
                    if (!userId) {
                        throw new Error("userId is required");
                    }

                    set({ loading: true });

                    const response = await getEnrollmentsByUserId({ userId });
                    if (!response) throw new Error("no get enrollments by user response");

                    // Agrupar inscrições do usuário por turma
                    set((state) => {
                        const updatedEnrollments = new Map(state.enrollments);

                        response.forEach((enrollment) => {
                            const classroomId = enrollment.classroom_id;
                            updatedEnrollments.set(classroomId, [...(updatedEnrollments.get(classroomId) || []), enrollment]);
                        });

                        return { enrollments: updatedEnrollments };
                    });

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.warn(
                            { err: error, userId, operation: "fetchEnrollmentsByUserId" },
                            "Error fetching enrollments by user id",
                        );
                    }
                    toast.error("Erro ao buscar inscrições do usuário!");

                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createNewEnrollments: async ({ enrollments }) => {
                try {
                    if (!enrollments.length) {
                        toast.error("Nenhum usuário selecionado para vincular à turma!");
                        throw new Error("empty enrollments array");
                    }

                    const response = await createEnrollments({ enrollments: Array.from(enrollments) });
                    if (!response || response.length === 0) throw new Error("No create enrollments response");

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
                    if (error instanceof Error) {
                        log.error(
                            { err: error, enrollments, operation: "createNewEnrollments" },
                            "Error creating new enrollments",
                        );
                    }
                    toast.error("Erro ao vincular usuários à turma!");

                    return false;
                }
            },

            updateEnrollmentByShortIdAndClassroomId: async ({ shortId, classroomId, updates }) => {
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
                    if (error instanceof Error) {
                        log.error(
                            { err: error, shortId, classroomId, updates, operation: "updateEnrollmentByShortIdAndClassroomId" },
                            "Error updating enrollment",
                        );
                    }
                    toast.error("Erro ao atualizar inscrição!");

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
                    if (error instanceof Error) {
                        log.error(
                            { err: error, userId, classroomIds, operation: "removeEnrollmentsByUserAndClassrooms" },
                            "Error removing enrollments",
                        );
                    }
                    toast.error("Erro ao remover vínculo usuário-turma!");

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
