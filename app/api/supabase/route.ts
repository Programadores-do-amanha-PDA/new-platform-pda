import { NextResponse } from "next/server";
import { login } from "@/utils/supabase/actions/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error(
        "Erro ao fazer o login. O Email e a Senha são obrigatórios!"
      );
    }

    const makeLogin = await login({ email, password });

    if (!makeLogin) {
      throw new Error("Erro ao fazer o login. Verifique suas credenciais.");
    }

    return NextResponse.json(
      { message: "Sucesso ao fazer o Login!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }
}
