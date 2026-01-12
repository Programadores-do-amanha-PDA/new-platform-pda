"use server";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = await createClient();

  await supabase.auth.getUser();

  return supabaseResponse;
}
