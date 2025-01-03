import { NextResponse } from "next/server";
import { getAllProfiles } from "@/utils/supabase/actions/profiles";

export async function GET() {
  try {
    const responseData = await getAllProfiles();
    if (!responseData) {
      throw new Error("Erro ao buscar usuários. Verifique suas credenciais de acesso.");
    }

    return NextResponse.json({ results: responseData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }
}
