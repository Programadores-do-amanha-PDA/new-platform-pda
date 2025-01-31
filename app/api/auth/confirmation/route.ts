import { NextRequest, NextResponse } from "next/server";
import { resendAnEmailSignupConfirmation } from "@/utils/supabase/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const resendEmailConfirmationResponse =
      await resendAnEmailSignupConfirmation(email);
    console.log(resendEmailConfirmationResponse);

    const response = NextResponse.json({}, { status: 200 });

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
