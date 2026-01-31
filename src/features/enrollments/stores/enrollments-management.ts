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
} from "../actions";
import { Enrollment } from "../types";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "EnrollmentsManagementStore" });

interface EnrollmentsManagementState {
    /** Enrollments indexed by userId for O(1) lookup */
    enrollmentsByUserId: Record<string, Enrollment[]>;
    loading: boolean;
}

interface EnrollmentsManagementActions {
    /**
     * Fetches every enrollment record.
     * @returns Resolves true on success, false otherwise.
     */
    fetchAllEnrollments: () => Promise<boolean>;

    /**
     * Fetches enrollments for a specific classroom.
     * @param classroomId Classroom identifier.
     * @returns Resolves true on success, false otherwise.
     */
    fetchEnrollmentsByClassroomId: (classroomId: string) => Promise<boolean>;

    /**
     * Fetches enrollments for a specific user.
     * @param userId User identifier.
     * @returns Resolves true on success, false otherwise.
     */
    fetchEnrollmentsByUserId: (userId: string) => Promise<boolean>;

    /**
     * Replaces the enrollments map indexed by userId.
     * @param enrollmentsByUserId Record containing the enrollments per userId.
     */
    setEnrollmentsByUserId: ({
        enrollmentsByUserId,
    }: {
        readonly enrollmentsByUserId: Record<string, Enrollment[]>;
    }) => void;

    /**
     * Returns every enrollment filtered by classroom_id.
     * @param classroomId Classroom identifier used to filter results.
     * @returns Array of enrollments for the provided classroom.
     */
    getEnrollmentsByClassroom: (classroomId: string) => Enrollment[];

    /**
     * Creates new enrollments.
     * @param enrollments Array describing the enrollments to create.
     * @returns Resolves true on success, false otherwise.
     */
    createNewEnrollments: ({
        enrollments,
    }: {
        enrollments: readonly Omit<Enrollment, "short_id" | "mode" | "created_at">[];
    }) => Promise<boolean>;

    /**
     * Updates a specific enrollment.
     * @param shortId Unique enrollment short id.
     * @param updates Fields to update (mode, etc.).
     * @returns Resolves true on success, false otherwise.
     */
    updateEnrollmentByShortIdAndUserId: ({
        shortId,
        userId,
        updates,
    }: {
        readonly shortId: string;
        readonly userId: string;
        readonly updates: Partial<Omit<Enrollment, "short_id" | "created_at" | "user_id" | "classroom_id">>;
    }) => Promise<boolean>;

    /**
     * Removes enrollments for a user on specific classrooms.
     * @param userId User identifier.
     * @param classroomIds Classroom identifiers to remove from the user.
     * @returns Resolves true on success, false otherwise.
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

const initialState: EnrollmentsManagementState = {
    enrollmentsByUserId: {},
    loading: false,
};


/**
 * Zustand store for managing enrollments state and actions in the application.
 *
 * This store provides methods to fetch, create, update, and remove enrollments,
 * as well as utilities for grouping enrollments by user and classroom.
 * It handles loading state, error notifications, and integrates with API services.
 *
 * ## State
 * - `enrollmentsByUserId`: Record mapping user IDs to their enrollments.
 * - `loading`: Indicates if an async operation is in progress.
 *
 * ## Actions
 * - `fetchAllEnrollments`: Fetches all enrollments and groups them by user ID.
 * - `fetchEnrollmentsByClassroomId`: Fetches enrollments for a specific classroom and merges them into the state.
 * - `fetchEnrollmentsByUserId`: Fetches enrollments for a specific user.
 * - `setEnrollmentsByUserId`: Sets the enrollments grouped by user ID.
 * - `getEnrollmentsByClassroom`: Returns all enrollments for a given classroom ID.
 * - `createNewEnrollments`: Creates new enrollments and adds them to the state.
 * - `updateEnrollmentByShortIdAndUserId`: Updates a specific enrollment by its short ID and user ID.
 * - `removeEnrollmentsByUserAndClassrooms`: Removes enrollments for a user in specified classrooms.
 * - `reset`: Resets the store to its initial state.
 *
 * @remarks
 * - Uses Zustand with devtools integration.
 * - Handles API errors with toast notifications and logging.
 * - Designed for use in React components and hooks.
 *
 * @example
 * const { fetchAllEnrollments, enrollmentsByUserId } = useEnrollmentsManagementStore();
 * await fetchAllEnrollments();
 * console.log(enrollmentsByUserId);
 */
export const useEnrollmentsManagementStore = create<EnrollmentsManagementState & EnrollmentsManagementActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            fetchAllEnrollments: async () => {
                try {
                    set({ loading: true });

                    const response = await getAllEnrollments();
                    if (!response) throw new Error("no get all enrollments response");

                    // Group enrollments by userId
                    const enrollmentsByUserId: Record<string, Enrollment[]> = {};
                    response.forEach((enrollment) => {
                        const userId = enrollment.user_id;
                        if (!enrollmentsByUserId[userId]) {
                            enrollmentsByUserId[userId] = [];
                        }
                        enrollmentsByUserId[userId].push(enrollment);
                    });

                    set({ enrollmentsByUserId });

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

                    // Group by userId and merge with existing
                    set((state) => {
                        const updatedEnrollments = { ...state.enrollmentsByUserId };

                        response.forEach((enrollment) => {
                            const userId = enrollment.user_id;
                            if (!updatedEnrollments[userId]) {
                                updatedEnrollments[userId] = [];
                            }
                            // Avoid duplicates
                            const exists = updatedEnrollments[userId].some((e) => e.short_id === enrollment.short_id);
                            if (!exists) {
                                updatedEnrollments[userId] = [...updatedEnrollments[userId], enrollment];
                            }
                        });

                        return { enrollmentsByUserId: updatedEnrollments };
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

                    set((state) => ({
                        enrollmentsByUserId: {
                            ...state.enrollmentsByUserId,
                            [userId]: response,
                        },
                    }));

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

            setEnrollmentsByUserId: ({ enrollmentsByUserId }) => {
                set({ enrollmentsByUserId });
            },

            getEnrollmentsByClassroom: (classroomId: string) => {
                const { enrollmentsByUserId } = get();
                const allEnrollments: Enrollment[] = [];

                Object.values(enrollmentsByUserId).forEach((userEnrollments) => {
                    userEnrollments.forEach((enrollment) => {
                        if (enrollment.classroom_id === classroomId) {
                            allEnrollments.push(enrollment);
                        }
                    });
                });

                return allEnrollments;
            },

            createNewEnrollments: async ({ enrollments }) => {
                try {
                    if (!enrollments.length) {
                        toast.error("Nenhum usuário selecionado para vincular à turma!");
                        throw new Error("empty enrollments array");
                    }

                    const response = await createEnrollments({ enrollments: Array.from(enrollments) });
                    if (!response || response.length === 0) throw new Error("No create enrollments response");

                    // Add enrollments grouped by userId
                    set((state) => {
                        const updatedEnrollments = { ...state.enrollmentsByUserId };

                        response.forEach((enrollment) => {
                            const userId = enrollment.user_id;
                            if (!updatedEnrollments[userId]) {
                                updatedEnrollments[userId] = [];
                            }
                            updatedEnrollments[userId] = [...updatedEnrollments[userId], enrollment];
                        });

                        return { enrollmentsByUserId: updatedEnrollments };
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

            updateEnrollmentByShortIdAndUserId: async ({ shortId, userId, updates }) => {
                try {
                    if (!shortId || !userId || !Object.keys(updates).length) {
                        throw new Error("short_id, userId and updates are required");
                    }

                    // Find the enrollment to get classroomId for the API call
                    const { enrollmentsByUserId } = get();
                    const userEnrollments = enrollmentsByUserId[userId] || [];
                    const enrollment = userEnrollments.find((e) => e.short_id === shortId);
                    if (!enrollment) throw new Error("Enrollment not found");

                    const response = await updateEnrollment({ shortId, classroomId: enrollment.classroom_id, updates });
                    if (!response) throw new Error("no update enrollment response");

                    // Update the specific enrollment
                    set((state) => {
                        const updatedEnrollments = { ...state.enrollmentsByUserId };
                        const userEnrollments = updatedEnrollments[userId] || [];

                        updatedEnrollments[userId] = userEnrollments.map((e) =>
                            e.short_id === shortId ? { ...e, ...updates } : e,
                        );

                        return { enrollmentsByUserId: updatedEnrollments };
                    });
                    toast.success("Inscrição atualizada com sucesso!");

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, shortId, userId, updates, operation: "updateEnrollmentByShortIdAndUserId" },
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

                    // Remove enrollments from the user
                    set((state) => {
                        const updatedEnrollments = { ...state.enrollmentsByUserId };
                        const userEnrollments = updatedEnrollments[userId] || [];

                        updatedEnrollments[userId] = userEnrollments.filter(
                            (e) => !classroomIds.includes(e.classroom_id),
                        );

                        return { enrollmentsByUserId: updatedEnrollments };
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
        { name: "EnrollmentsManagementStore" },
    ),
);
