"use server";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/api-error";
import { authenticateWithSupabase } from "@/app/api/middleware/supabase-auth";
import { userCredentialsSchema } from "./utils/validations";
import { logInfo, logError } from "@/lib/logger";
import { UserCredentialsEmailService } from "./utils/user-credentials-email-service";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateWithSupabase();

    // Log with user context
    logInfo("Sending user credentials email", {
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

    logInfo("Credentials email sent successfully", {
      userId: user.userId,
      recipient: validatedData.email,
    });

    return NextResponse.json({
      status: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    logError("Error sending credentials email", error);
    return handleApiError(error);
  }
}
