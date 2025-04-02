"use server";
import { getZoomAccountById } from "@/app/actions/classrooms/zoom/accounts";
import { cookies } from "next/headers";

type TokenData = {
  access_token: string;
  expires_at: number;
  expires_in: number;
};

function isTokenValid(tokenData: TokenData): boolean {
  const BUFFER_TIME = 300000; // 5 minutos antes da expiração
  return tokenData?.expires_at > Date.now() + BUFFER_TIME;
}

export async function getAccessToken({
  account_id,
  token_key,
}: {
  account_id: string;
  token_key: string;
}): Promise<string> {
  const cookieStore = cookies();

  try {
    const storedToken = cookieStore.get(token_key)?.value;

    if (storedToken) {
      const tokenData = JSON.parse(storedToken);
      if (isTokenValid(tokenData)) {
        return tokenData.access_token;
      }
    }

    const account = await getZoomAccountById(account_id);
    if (!account) {
      throw new Error("Zoom account not found");
    }

    const authHeader = `Basic ${Buffer.from(
      `${account.client_id}:${account.client_secret}`
    ).toString("base64")}`;
    const params = new URLSearchParams();
    params.append("grant_type", "account_credentials");
    params.append("account_id", account_id);

    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Falha na autenticação");
    }

    const tokenData = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000,
      expires_in: data.expires_in,
    };

    cookieStore.set({
      name: token_key,
      value: JSON.stringify(tokenData),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: data.expires_in,
      path: "/",
    });

    return tokenData.access_token;
  } catch (error) {
    console.error("Erro na autenticação:", error);
    throw new Error("Falha na autenticação com Zoom");
  }
}
