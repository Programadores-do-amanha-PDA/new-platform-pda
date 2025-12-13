import * as z from "zod/mini";

export const newJobApplicationFormSchema = z.object({
    jobId: z.email("job-id-required"),
    status: z.string().check(z.minLength(1, "application-status-required"), z.trim()),
    observation: z.nullable(z.optional(z.string())),
});


export const updateJobApplicationFormSchema = z.object({
    status: z.string().check(z.minLength(1, "application-status-required"), z.trim()),
    observation: z.nullable(z.optional(z.string())),
});
