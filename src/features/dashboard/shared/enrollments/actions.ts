"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { Enrollment } from "@/features/dashboard/shared/enrollments";

const log = logger.child({ module: "enrollments." });

type GetAllEnrollmentsResult = Enrollment[] | null;

type GetEnrollmentsByClassroomIdProps = {
    classroom_id: string;
};
type GetEnrollmentsByClassroomIdResult = Enrollment[] | null;

type GetEnrollmentsByUserIdProps = {
    userId: string;
};
type GetEnrollmentsByUserIdResult = Enrollment[] | null;

type CreateEnrollmentsProps = {
    enrollments: Omit<Enrollment, "short_id" | "mode" | "created_at">[];
};
type CreateEnrollmentsResult = Enrollment[] | null;

type UpdateEnrollmentProps = {
    classroomId: string;
    shortId: string;
    updates: Partial<Omit<Enrollment, "short_id" | "classroom_id" | "created_at">>;
};
type UpdateEnrollmentReturn = Enrollment[] | null;

type DeleteEnrollmentsProps = {
    userId: string;
    classroomIds: string[];
};
type DeleteEnrollmentsReturn = boolean;

/**
 * Busca todas as inscrições de usuários em salas de aula.
 * @returns Array de inscrições ou null em caso de erro.
 */
export const getAllEnrollments = async (): Promise<GetAllEnrollmentsResult> => {
    try {
        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("user_classrooms").select().order("created_at", { ascending: false });
        if (error) throw error;

        return data as Enrollment[];
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, operation: "getAllEnrollments" }, "Error on get all enrollments");
        }
        return null;
    }
};

/**
 * Busca todas as inscrições de usuários em uma sala de aula específica.
 * @param classroom_id ID da sala de aula.
 * @returns Array de inscrições ou null em caso de erro.
 */
export const getEnrollmentsByClassroomId = async ({
    classroom_id,
}: GetEnrollmentsByClassroomIdProps): Promise<GetEnrollmentsByClassroomIdResult> => {
    try {
        if (!classroom_id) throw new Error("classroom_id is required");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("user_classrooms")
            .select()
            .eq("classroom_id", classroom_id)
            .order("created_at", { ascending: false });
        if (error) throw error;

        return data as Enrollment[];
    } catch (error) {
        if (error instanceof Error)
            log.error(
                { err: error, classroom_id, operation: "getEnrollmentsByClassroomId" },
                "Error on get enrollments by classroom id",
            );
        return null;
    }
};

/**
 * Busca todas as inscrições de um usuário em salas de aula.
 * @param userId ID do usuário.
 * @returns Array de inscrições ou null em caso de erro.
 */
export const getEnrollmentsByUserId = async ({
    userId,
}: GetEnrollmentsByUserIdProps): Promise<GetEnrollmentsByUserIdResult> => {
    try {
        if (!userId) throw new Error("userId is required");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("user_classrooms")
            .select()
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (error) throw error;

        return data as Enrollment[];
    } catch (error) {
        if (error instanceof Error)
            log.error({ err: error, userId, operation: "getEnrollmentsByUserId" }, "Error on get enrollments by user id");
        return null;
    }
};

/**
 * Cria novas inscrições de usuários em salas de aula.
 * @param enrollments Array de inscrições a serem criadas.
 * @returns Array de inscrições criadas ou null em caso de erro.
 */
export const createEnrollments = async ({ enrollments }: CreateEnrollmentsProps): Promise<CreateEnrollmentsResult> => {
    try {
        if (!enrollments || enrollments.length === 0) {
            throw new Error("No enrollments provided for creation");
        }

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from("user_classrooms").insert(enrollments).select();
        if (error) throw error;
        if (!data) throw new Error("No data returned from createEnrollments");

        log.info({ enrollments, operation: "createEnrollments" }, "Enrollments created successfully");
        return data as Enrollment[];
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, enrollments, operation: "createEnrollments" }, "Error on create enrollments");
        }

        return null;
    }
};

/**
 * Atualiza uma inscrição de um usuário em uma sala de aula.
 * @param classroomId ID da sala de aula.
 * @param shortId ID curto da inscrição.
 * @param updates Objeto contendo os campos a serem atualizados.
 * @returns Array com a inscrição atualizada ou null em caso de erro.
 */
export const updateEnrollment = async ({
    shortId,
    classroomId,
    updates,
}: UpdateEnrollmentProps): Promise<UpdateEnrollmentReturn> => {
    try {
        if (!shortId || !classroomId) {
            throw new Error("shortId and classroomId are required for updating enrollment");
        }
        if (!updates || Object.keys(updates).length === 0) {
            throw new Error("No updates provided for enrollment");
        }

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("user_classrooms")
            .update(updates)
            .eq("short_id", shortId)
            .eq("classroom_id", classroomId)
            .select();
        if (error) throw error;
        if (!data) throw new Error("No data returned from updateEnrollment");

        log.info({ shortId, classroomId, updates, operation: "updateEnrollment" }, "Enrollment updated successfully");

        return data as Enrollment[];
    } catch (error) {
        console.error("Error on update enrollment", error);
        return null;
    }
};

/**
 * Remove inscrições de um usuário em salas de aula.
 * @param userId ID do usuário.
 * @param classroomIds Array de IDs das salas de aula.
 * @returns true se deletado com sucesso, false caso contrário.
 */
export const removeEnrollments = async ({ userId, classroomIds }: DeleteEnrollmentsProps): Promise<DeleteEnrollmentsReturn> => {
    try {
        if (!userId || !classroomIds || classroomIds.length === 0) {
            throw new Error("userId and classroomIds are required for removing enrollments");
        }

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("user_classrooms")
            .delete()
            .eq("user_id", userId)
            .in("classroom_id", classroomIds);
        if (error) throw error;

        return true;
    } catch (error) {
        if (error instanceof Error)
            log.error({ err: error, userId, classroomIds, operation: "removeEnrollments" }, "Error on remove enrollments");
        return false;
    }
};
