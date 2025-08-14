"use server";
import { ZoomAccountT } from "@/types/classroom-zoom";
import { Buffer } from "buffer";
import { cookies } from "next/headers";

type TokenData = {
  access_token: string;
  expires_at: number;
  expires_in: number;
  account_id: string;
  client_id: string;
};

type ClientTokenCache = {
  [client_id: string]: TokenData[];
};

function isTokenValid(tokenData: TokenData): boolean {
  const BUFFER_TIME = 300000;
  return tokenData?.expires_at > Date.now() + BUFFER_TIME;
}

function getClientTokenCache(): ClientTokenCache {
  const cookieStore = cookies();
  const cacheData = cookieStore.get("zoom_client_token_cache")?.value;

  if (!cacheData) {
    return {};
  }

  try {
    return JSON.parse(cacheData);
  } catch {
    return {};
  }
}

function saveClientTokenCache(cache: ClientTokenCache): void {
  const cookieStore = cookies();

  // Remove tokens expirados antes de salvar
  const cleanCache: ClientTokenCache = {};
  Object.keys(cache).forEach((clientId) => {
    const validTokens = cache[clientId].filter((token) => isTokenValid(token));
    if (validTokens.length > 0) {
      cleanCache[clientId] = validTokens;
    }
  });

  cookieStore.set({
    name: "zoom_client_token_cache",
    value: JSON.stringify(cleanCache),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });
}

function findValidTokenByClientId(
  client_id: string,
  account_id: string
): TokenData | null {
  const cache = getClientTokenCache();
  const clientTokens = cache[client_id] || [];

  return (
    clientTokens.find(
      (token) => token.account_id === account_id && isTokenValid(token)
    ) || null
  );
}

export async function clearTokenCache(
  account_id: string,
  client_id?: string
): Promise<void> {
  const cookieStore = cookies();

  // Remove do cache antigo (compatibilidade)
  cookieStore.delete(`zoom_access_token_key_${account_id}`);

  // Remove do novo cache baseado em client_id
  if (client_id) {
    const cache = getClientTokenCache();
    if (cache[client_id]) {
      cache[client_id] = cache[client_id].filter(
        (token) => token.account_id !== account_id
      );
      if (cache[client_id].length === 0) {
        delete cache[client_id];
      }
      saveClientTokenCache(cache);
    }
  }
}

export async function clearAllTokensForClient(
  client_id: string
): Promise<void> {
  const cache = getClientTokenCache();
  if (cache[client_id]) {
    delete cache[client_id];
    saveClientTokenCache(cache);
  }
}

export async function getAccessTokenForValidation({
  account_id,
  client_id,
  client_secret,
}: Omit<
  ZoomAccountT,
  "me" | "label" | "id" | "created_at" | "label" | "classroom_id"
>): Promise<string> {
  return getAccessToken({ account_id, client_id, client_secret }, true);
}

export async function getAccessToken(
  {
    account_id,
    client_id,
    client_secret,
  }: Omit<
    ZoomAccountT,
    "me" | "label" | "id" | "created_at" | "label" | "classroom_id"
  >,
  forceRefresh: boolean = false
): Promise<string> {
  const cookieStore = cookies();

  try {
    if (!forceRefresh && client_id) {
      // Verifica no novo cache baseado em client_id
      const cachedToken = findValidTokenByClientId(client_id, account_id);
      if (cachedToken) {
        return cachedToken.access_token;
      }

      // Fallback para o cache antigo (compatibilidade)
      const storedToken = cookieStore.get(
        `zoom_access_token_key_${account_id}`
      )?.value;

      if (storedToken) {
        const tokenData = JSON.parse(storedToken);
        if (isTokenValid(tokenData)) {
          return tokenData.access_token;
        }
      }
    }

    if (!client_id || !client_secret) {
      throw new Error("Zoom account not found");
    }

    const authHeader = `Basic ${Buffer.from(
      `${client_id}:${client_secret}`
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

    const tokenData: TokenData = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000,
      expires_in: data.expires_in,
      account_id,
      client_id,
    };

    // Salva no novo cache baseado em client_id
    const cache = getClientTokenCache();
    if (!cache[client_id]) {
      cache[client_id] = [];
    }

    // Remove token antigo para este account_id se existir
    cache[client_id] = cache[client_id].filter(
      (token) => token.account_id !== account_id
    );

    // Adiciona o novo token
    cache[client_id].push(tokenData);

    saveClientTokenCache(cache);

    // Mantém compatibilidade com cache antigo
    cookieStore.set({
      name: `zoom_access_token_key_${account_id}`,
      value: JSON.stringify({
        access_token: tokenData.access_token,
        expires_at: tokenData.expires_at,
        expires_in: tokenData.expires_in,
      }),
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
