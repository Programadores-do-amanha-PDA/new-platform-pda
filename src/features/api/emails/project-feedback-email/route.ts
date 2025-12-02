"use server";

import { NextRequest, NextResponse } from "next/server";
import { authenticateWithSupabase } from "@/app/api/middleware/supabase-auth";
import { handleApiError } from "@/lib/errors/api-error";
import { projectFeedbackSchema } from "./utils/validations";
import { ProjectFeedbackEmailService } from "./utils/project-feedback-email-service";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "emails.project-feedback-email" });

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateWithSupabase();

        log.info(
            {
                userId: user.userId,
                email: user.email,
                role: user.role,
            },
            "Sending project feedback email",
        );

        const body = await request.json();
        const validatedData = projectFeedbackSchema.parse(body);

        //  TODO exchange role permissions

        await ProjectFeedbackEmailService.sendProjectFeedbackEmail(validatedData);

        log.info(
            {
                userId: user.userId,
                recipient: validatedData.email,
            },
            "Feedback email sent successfully",
        );

        return NextResponse.json({
            status: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        log.error({ err: error }, "Error sending feedback email");
        return handleApiError(error);
    }
}
