import {
  adminCreateUser,
  adminDeleteUser,
  adminGetAllUsers,
} from "@/utils/supabase/actions/auth_admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const responseData = await adminGetAllUsers();
    if (!responseData) {
      throw new Error(
        "Erro ao buscar usuários. Verifique suas credenciais de acesso."
      );
    }

    return NextResponse.json({ results: responseData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (
      !data.email ||
      !data.password ||
      !data.user_metadata ||
      !data.user_metadata.full_name ||
      !data.user_metadata.user_email
    ) {
      throw new Error("Erro ao cadastrar o usuário. Verifique os dados.");
    }

    const responseData = await adminCreateUser(data);

    if (!responseData) {
      throw new Error(
        "Erro ao cadastrar o usuário. Tente novamente mais tarde!"
      );
    }

    return NextResponse.json({ new_user: responseData }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    console.log(id);

    if (!id) {
      throw new Error("Erro ao deletar o usuário. Verifique os dados.");
    }

    const responseData = await adminDeleteUser(id);

    if (!responseData) {
      throw new Error("Erro ao deletar o usuário. Tente novamente mais tarde!");
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }
}
