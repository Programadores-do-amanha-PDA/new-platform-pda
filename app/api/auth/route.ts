import { NextRequest, NextResponse } from "next/server";
import { login, signOut } from "@/utils/supabase/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const loginResponse = await login({ email, password });

    if (loginResponse === "Email not confirmed") {
      const response = NextResponse.json(
        { error: "Email not confirmed" },
        { status: 403 }
      );
      response.cookies.set("user_email", email, { maxAge: 3600 });
      return response;
    }

    if (!loginResponse?.user || !loginResponse?.session) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json(loginResponse, { status: 200 });

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await signOut();

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
