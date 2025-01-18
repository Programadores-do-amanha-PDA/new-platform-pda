import {
  getAllUserRoles,
  insertUserRoleWithUserId,
} from "@/utils/supabase/actions/roles";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const responseData = await getAllUserRoles();

    if (!responseData) {
      throw new Error(
        "Erro ao buscar cargos. Verifique suas credenciais de acesso."
      );
    }

    return NextResponse.json({ results: responseData }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();
    console.log(userId, role);
    if (!userId || !role) {
      throw new Error(
        "Erro ao inserir cargo. Verifique suas credenciais de acesso."
      );
    }

    const responseData = await insertUserRoleWithUserId(userId, role);

    if (!responseData) {
      throw new Error(
        "Erro ao buscar cargos. Verifique suas credenciais de acesso."
      );
    }

    return NextResponse.json({ results: responseData }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 401 }
    );
  }
}
