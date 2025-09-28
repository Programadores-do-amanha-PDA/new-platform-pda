"use server";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/api-error";
import { authenticateWithSupabase } from "@/app/api/middleware/supabase-auth";
import { userCredentialsSchema } from "./utils/validations";
import { logger } from "@/lib/logger";
import { UserCredentialsEmailService } from "./utils/user-credentials-email-service";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateWithSupabase();

    // Log with user context
    logger.info("Sending user credentials email", {
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    const body = await request.json();
    const validatedData = userCredentialsSchema.parse(body);

    //  TODO exchange role permissions
    // if (user.role !== "admin") {
    //   throw new ApiError(
    //     403,
    //     "Not allowed to send user credentials"
    //   );
    // }

    await UserCredentialsEmailService.sendUserCredentialsEmail(validatedData);

    logger.info("Credentials email sent successfully", {
      userId: user.userId,
      recipient: validatedData.email,
    });

    return NextResponse.json({
      status: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    logger.error("Error sending credentials email", error);
    return handleApiError(error);
  }
}
