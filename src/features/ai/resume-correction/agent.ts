import { Output, ToolLoopAgent } from "ai";
import { RESUME_CORRECTION_INSTRUCTIONS, RESUME_CORRECTION_OUTPUT_SCHEMA, RESUME_CORRECTION_PROMPT, ResumeCorrectionOutput } from "./utils";
import { openRouter } from "@/lib/ai-providers";

export async function generateResumeCorrectionAsync({ resume, prompt }: { resume: string; prompt?: string }) {
    const resumeCorrectionAgent = new ToolLoopAgent({
        model: openRouter("xiaomi/mimo-v2-flash:free"),
        temperature: 0.4,
        maxRetries: 3,
        output: Output.object({
            schema: RESUME_CORRECTION_OUTPUT_SCHEMA,
        }),
        instructions: RESUME_CORRECTION_INSTRUCTIONS,
    });

    const response = await resumeCorrectionAgent.generate({
        prompt: RESUME_CORRECTION_PROMPT.replace("{{resume_text}}", resume).concat(`
            prompt do usuário:
            ${prompt ?? ""}
`),
    });

    console.log("Resume Correction:", response.output);
    return response.output as ResumeCorrectionOutput;
}
