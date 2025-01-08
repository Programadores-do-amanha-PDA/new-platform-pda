import { getRoleWithUserId } from "@/utils/supabase/actions/roles";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get("user_id");

    if (!user_id) {
      throw new Error("Erro ao buscar cargos! O id do usuário é obrigatório!");
    }

    const responseData = await getRoleWithUserId(user_id);

    if (!responseData) {
      throw new Error(
        "Erro ao buscar cargos. Verifique suas credenciais de acesso."
      );
    }

    return NextResponse.json({ results: responseData }, { status: 200 });
  } catch (error) {
      console.log(error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 401 }
    );
  }
}
