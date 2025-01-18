import { NextResponse } from "next/server";
import { makeSingUpWithEmailProvider } from "@/utils/supabase/actions/auth";

export async function POST(req: Request) {
  try {
    const { email, password, full_name } = await req.json();

    if (!email || !password) {
      throw new Error(
        "Erro ao criar usuário. O Email e a Senha são obrigatórios!"
      );
    }

    const userId = await makeSingUpWithEmailProvider({
      email: email,
      password: password,
      options: {
        data: {
          user_email: email,
          full_name: full_name,
        },
      },
    });

    if (!userId) {
      throw new Error("Erro ao criar usuário. Verifique os dados.");
    }

    return NextResponse.json(
      { message: "Sucesso ao criar o usuário!", user_id: userId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }
}
