"use server";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/api-error";
import { authenticateWithSupabase } from "@/app/api/middleware/supabase-auth";
import { userCredentialsSchema } from "./utils/validations";
import { UserCredentialsEmailService } from "./utils/user-credentials-email-service";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "email.user-credentials" });

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateWithSupabase();

        log.info(
            {
                userId: user.userId,
                email: user.email,
                role: user.role,
            },
            "Sending user credentials email",
        );

        const body = await request.json();
        const validatedData = userCredentialsSchema.parse(body);

        //  TODO exchange role permissions

        await UserCredentialsEmailService.sendUserCredentialsEmail(validatedData);

        log.info(
            {
                userId: user.userId,
                recipient: validatedData.email,
            },
            "Credentials email sent successfully",
        );

        return NextResponse.json({
            status: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        log.error({ err: error }, "Error sending credentials email");
        return handleApiError(error);
    }
}
