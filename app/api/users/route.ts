import { adminGetAllUsers } from "@/utils/supabase/actions/auth_admin";
import { getAllProfiles } from "@/utils/supabase/actions/profiles";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authAdminUsers = await adminGetAllUsers();
    const profiles = await getAllProfiles();

    if (!authAdminUsers || !profiles) {
      throw new Error(
        "Erro ao buscar usuários. Verifique suas credenciais de acesso."
      );
    }
    const allUsers = authAdminUsers.map((authUser) => ({
      ...authUser,
      profile: profiles?.find((p) => p.id === authUser.id),
    }));

    return NextResponse.json({ results: allUsers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }
}
