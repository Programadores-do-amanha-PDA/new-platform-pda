"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { CoodeshAssessment, CoodeshAssessmentPayload } from "./types";

const log = logger.child({ module: "coodesh.actions" });

/**
 * Creates a new Coodesh assessment in the classroom.
 *
 * @param {Partial<CoodeshAssessmentPayload>} assessmentData - The assessment data to create
 * @returns {Promise<CoodeshAssessmentPayload | null>} Returns the created assessment or null if error occurs
 *
 * @example
 * const assessment = await createCoodeshAssessment({ classroom_id: '123', ... });
 */
export const createCoodeshAssessment = async (
    assessmentData: Partial<CoodeshAssessmentPayload>,
): Promise<CoodeshAssessment | null> => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from("classroom_coodesh_assessments").insert([assessmentData]).select();

        if (error) throw error;
        return data[0] as CoodeshAssessment;
    } catch (error) {
        log.error(
            { err: error, assessmentData, operation: "createCoodeshAssessment" },
            "Error creating classroom coodesh assessment",
        );
        return null;
    }
};

/**
 * Fetches all Coodesh assessments for a specific classroom.
 *
 * @param {string} classroomId - The classroom ID
 * @returns {Promise<CoodeshAssessment[] | null>} Returns array of assessments or null if error occurs
 *
 * @example
 * const assessments = await getAllCoodeshAssessmentByClassroomId('classroom-123');
 */
export const getAllCoodeshAssessmentByClassroomId = async ({
    classroomId,
}: {
    classroomId: string;
}): Promise<CoodeshAssessment[] | null> => {
    try {
        if (!classroomId) throw new Error("Classroom ID is required");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client initialization failed");

        const { data, error } = await supabase
            .from("classroom_coodesh_assessments")
            .select()
            .eq("classroom_id", classroomId)
            .order("created_at", { ascending: false });
        if (error) throw error;

        return data as CoodeshAssessment[];
    } catch (error) {
        log.error(
            { err: error, classroomId, operation: "getAllCoodeshAssessmentByClassroomId" },
            "Error fetching all classroom coodesh assessments",
        );
        return null;
    }
};

/**
 * Fetches a specific Coodesh assessment by ID.
 *
 * @param {number} id - The assessment ID
 * @returns {Promise<CoodeshAssessment | null>} Returns the assessment or null if error occurs
 *
 * @example
 * const assessment = await getCoodeshAssessmentById(123);
 */
export const getCoodeshAssessmentById = async (id: number): Promise<CoodeshAssessment | null> => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from("classroom_coodesh_assessments").select().eq("id", id).single();

        if (error) throw error;
        return data as CoodeshAssessment;
    } catch (error) {
        log.error({ err: error, id, operation: "getCoodeshAssessmentById" }, "Error fetching classroom coodesh assessment");
        return null;
    }
};

/**
 * Updates an existing Coodesh assessment.
 *
 * @param {string} id - The assessment ID
 * @param {Partial<CoodeshAssessment>} assessmentData - The assessment data to update
 * @returns {Promise<CoodeshAssessment | null>} Returns the updated assessment or null if error occurs
 *
 * @example
 * const assessment = await updateCoodeshAssessment('123', { status: 'completed' });
 */
export const updateCoodeshAssessment = async (
    id: string,
    assessmentData: Partial<CoodeshAssessment>,
): Promise<CoodeshAssessment | null> => {
    try {
        const supabase = await createClient();

        const updates = { ...assessmentData, updated_at: new Date().toISOString() };

        const { data, error } = await supabase.from("classroom_coodesh_assessments").update(updates).eq("id", id).select();

        if (error) throw error;
        return data[0] as CoodeshAssessment;
    } catch (error) {
        log.error(
            { err: error, id, assessmentData, operation: "updateCoodeshAssessment" },
            "Error updating classroom coodesh assessment",
        );
        return null;
    }
};

/**
 * Deletes a Coodesh assessment.
 *
 * @param {string} id - The assessment ID
 * @returns {Promise<boolean>} Returns true if the deletion was successful, false otherwise
 *
 * @example
 * const success = await deleteCoodeshAssessment('123');
 */
export const deleteCoodeshAssessment = async (id: string): Promise<boolean> => {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from("classroom_coodesh_assessments").delete().eq("id", id);

        if (error) throw error;
        return true;
    } catch (error) {
        log.error({ err: error, id, operation: "deleteCoodeshAssessment" }, "Error deleting classroom coodesh assessment");
        return false;
    }
};
