import z from "zod";

export const REVIEW_OUTPUT_SCHEMA = z.object({
    review: z.string(),
    keys_points: z.array(z.string()),
    suggestions_points: z.array(z.string()).optional(),
});

export const SUGGESTIONS_AND_KEY_POINTS_ENHANCEMENTS_OUTPUT_SCHEMA = z.object({
    suggestions: z
        .array(
            z.object({
                suggestion_point: z.string(),
                suggestion_description: z.string(),
            }),
        )
        .min(1)
        .max(10),
    key_points: z
        .array(
            z.object({
                key_point: z.string(),
                key_point_description: z.string(),
            }),
        )
        .min(1)
        .max(10),
});


export const RESUME_CORRECTION_FEEDBACK_AND_OVERALL_RATING_OUTPUT_SCHEMA = z.object({
    resume_correction_feedback: z.string(),
    overall_rating: z.number().min(1).max(10), 
})