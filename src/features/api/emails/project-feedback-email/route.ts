"use server";
import { NextRequest, NextResponse } from "next/server";
import { authenticateWithSupabase } from "@/app/api/middleware/supabase-auth";
import { handleApiError } from "@/lib/errors/api-error";
import { logger } from "@/lib/logger";

import { projectFeedbackSchema } from "./utils/validations";
import { ProjectFeedbackEmailService } from "./utils/project-feedback-email-service";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateWithSupabase();

    // Log com contexto do usuário
    logger.info("Sending project feedback email", {
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    const body = await request.json();
    const validatedData = projectFeedbackSchema.parse(body);

    //  TODO exchange role permissions
    // if (user.role !== "admin") {
    //   throw new ApiError(
    //     403,
    //     "Not allowed to send user credentials"
    //   );
    // }

    await ProjectFeedbackEmailService.sendProjectFeedbackEmail(validatedData);

    logger.info("Feedback email sent successfully", {
      userId: user.userId,
      recipient: validatedData.email,
    });

    return NextResponse.json({
      status: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    logger.error("Error sending feedback email", error);
    return handleApiError(error);
  }
}
