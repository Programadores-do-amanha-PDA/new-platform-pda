import z from "zod";

export const RESUME_CORRECTION_OUTPUT_SCHEMA = z.object({
    review: z.string(),
    keys_points: z.array(
        z.object({
            keys_point_title: z.string(),
            keys_point_description: z.string(),
        }),
    ),
    overall_rating: z.number().min(1).max(10),
});

export type ResumeCorrectionOutput = z.infer<typeof RESUME_CORRECTION_OUTPUT_SCHEMA>;
