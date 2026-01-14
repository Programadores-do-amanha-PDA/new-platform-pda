import { generateText, Output } from "ai";
import { RESUME_CORRECTION_STEPS } from "./utils/resume-corrections-agent-steps";

export async function generateResumeCorrectionAsync({ resume }: { resume: string }) {
    // First step: generating initial resume review
    const { text: resumeReview } = await generateText({
        model: RESUME_CORRECTION_STEPS.review.model,
        temperature: 0.4,
        maxRetries: 3,
        output: Output.object({
            schema: RESUME_CORRECTION_STEPS.review.outputSchema,
        }),
        prompt: RESUME_CORRECTION_STEPS.review.promptTemplate.replace("{{resume_json}}", resume),
    });

    console.log("Resume Review:", resumeReview);
    return resumeReview;

    // // Perform quality check on copy
    // const { text: resumeKeyPointsEnhanced } = await generateText({
    //     model: MODEL_BY_STEPS.suggestImprovements,
    //     maxOutputTokens: 512,
    //     temperature: 0.4,
    //     maxRetries: 3,
    //     output: Output.object({
    //         schema: z.object({
    //             keys_points: z.array(z.string()),
    //         }),
    //     }),
    //     prompt: `Evaluate this marketing copy for:
    // 1. Presence of call to action (true/false)
    // 2. Emotional appeal (1-10)
    // 3. Clarity (1-10)

    // Copy to evaluate: ${copy}`,
    // });

    // // If quality check fails, regenerate with more specific instructions
    // if (!qualityMetrics.hasCallToAction || qualityMetrics.emotionalAppeal < 7 || qualityMetrics.clarity < 7) {
    //     const { text: improvedCopy } = await generateText({
    //         model: MODEL_BY_STEPS.finalize,
    //         prompt: `Rewrite this marketing copy with:
    //   ${!qualityMetrics.hasCallToAction ? "- A clear call to action" : ""}
    //   ${qualityMetrics.emotionalAppeal < 7 ? "- Stronger emotional appeal" : ""}
    //   ${qualityMetrics.clarity < 7 ? "- Improved clarity and directness" : ""}

    //   Original copy: ${copy}`,
    //     });
    //     return { copy: improvedCopy, qualityMetrics };
    // }

    // return { copy, qualityMetrics };
}
