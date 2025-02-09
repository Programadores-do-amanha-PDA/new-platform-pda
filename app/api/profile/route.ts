import { getProfileById } from "@/utils/supabase/actions/profiles";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    console.log(id);

    if (!id) {
      return NextResponse.json({ message: "id is undefine!" }, { status: 401 });
    }

    const response = await getProfileById(id);
    console.log(response);
    if (!response) {
      return NextResponse.json(
        { message: "Profile not found!" },
        { status: 404 }
      );
    }
    return NextResponse.json({ result: response }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
