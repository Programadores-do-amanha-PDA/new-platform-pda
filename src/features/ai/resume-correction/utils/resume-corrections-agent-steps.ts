import { openRouter } from "@/lib/ai-providers";
import { REVIEW_RESUME_PROMPT } from "./prompts-templates";
import z from "zod";
import { REVIEW_OUTPUT_SCHEMA, SUGGESTIONS_AND_KEY_POINTS_ENHANCEMENTS_OUTPUT_SCHEMA } from "./schemas";

export const RESUME_CORRECTION_STEPS = {
    review: {
        model: openRouter("xiaomi/mimo-v2-flash:free"),
        promptTemplate: REVIEW_RESUME_PROMPT,
        outputSchema: REVIEW_OUTPUT_SCHEMA,
    },
    suggestionsAndKeyPointsImprovements: {
        model: openRouter("xiaomi/mimo-v2-flash:free"),
        promptTemplate: "",
        outputSchema: SUGGESTIONS_AND_KEY_POINTS_ENHANCEMENTS_OUTPUT_SCHEMA
    },
    finalize: {
        model: openRouter("google/gemini-2.0-flash-exp:free"),
        promptTemplate: "",
        outputSchema: z.object({
            resume_correction_feedback: z.string(),
            suggestions: z
                .array(
                    z.object({
                        suggestion_point: z.string(),
                        suggestion_description: z.string(),
                    }),
                )
                .optional(),
            overall_rating: z.number().min(1).max(10),
        }),
    },
} as const;
