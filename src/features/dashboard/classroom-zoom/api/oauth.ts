"use server";
import { Buffer } from "buffer";
import { cookies } from "next/headers";
import { ClientTokenCache, TokenData, ZoomAccountT } from "../types";

function isTokenValid(tokenData: TokenData): boolean {
  // Consider a small buffer time to account for delays
  const BUFFER_TIME = 300000;

  // Check if token exists and is not expired
  if (!tokenData || !tokenData.expires_at) return false;

  // Check if token is valid for at least the buffer time
  const isTokenExpired = tokenData.expires_at < Date.now() + BUFFER_TIME;
  if (isTokenExpired) return false;

  return true;
}

function getClientTokenCache(): ClientTokenCache {
  try {
    // Initialize cookie store
    const cookieStore = cookies();

    // Retrieve the token cache
    const cacheData = cookieStore.get("zoom_client_token_cache")?.value;

    // If no cache found, return empty object
    if (!cacheData) {
      return {};
    }

    // Parse the token cache data
    return JSON.parse(cacheData);
  } catch {
    return {};
  }
}

function saveClientTokenCache(cache: ClientTokenCache): void {
  // Initialize cookie store
  const cookieStore = cookies();

  // Remove expires tokens before saving
  const cleanCache: ClientTokenCache = {};

  Object.keys(cache).forEach((clientId) => {
    // Keep only valid tokens for each client_id
    const validTokens = cache[clientId].filter((token) => isTokenValid(token));

    // If there are valid tokens, keep them in the clean cache
    if (validTokens.length > 0) {
      cleanCache[clientId] = validTokens;
    }
  });

  // Save the cleaned cache back to cookies
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
  // Validate client ID and account ID
  if (!client_id || !account_id) return null;

  // Retrieve the token cache
  const cache = getClientTokenCache();

  // Check if there are tokens for the given client_id
  const clientTokens = cache[client_id] || [];

  // Find a valid token for the specific account_id
  const validToken =
    clientTokens.find(
      (token) => token.account_id === account_id && isTokenValid(token)
    ) || null;

  return validToken;
}

export async function clearTokenCache(
  account_id: string,
  client_id?: string
): Promise<void> {
  const cookieStore = cookies();

  // remove old cache based on account_id for compatibility
  cookieStore.delete(`zoom_access_token_key_${account_id}`);

  if (client_id) {
    // remove from new cache based on client_id
    const cache = getClientTokenCache();
    if (cache[client_id]) {
      // Remove tokens for the specific account_id
      cache[client_id] = cache[client_id].filter(
        (token) => token.account_id !== account_id
      );
      // If no tokens left for this client_id, remove the client_id entry
      if (cache[client_id].length === 0) {
        delete cache[client_id];
      }
      // Save the updated cache
      saveClientTokenCache(cache);
    }
  }
}

export async function clearAllTokensForClient(
  client_id: string
): Promise<void> {
  // remove from new cache based on client_id
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
}: Pick<
  ZoomAccountT,
  "account_id" | "client_id" | "client_secret"
>): Promise<string> {
  return getAccessToken({ account_id, client_id, client_secret }, true);
}

export async function getAccessToken(
  {
    account_id,
    client_id,
    client_secret,
  }: Pick<ZoomAccountT, "account_id" | "client_id" | "client_secret">,
  forceRefresh: boolean = false
): Promise<string> {
  try {
    // Initialize cookie store
    const cookieStore = cookies();

    // try to get a valid token from cache
    if (!forceRefresh && client_id) {
      // Check new cache based on client_id
      const cachedToken = findValidTokenByClientId(client_id, account_id);
      if (cachedToken) {
        return cachedToken.access_token;
      }

      // Fallback to old cache based on account_id for compatibility
      const storedToken = cookieStore.get(
        `zoom_access_token_key_${account_id}`
      )?.value;

      // If found, parse and validate
      if (storedToken) {
        const tokenData = JSON.parse(storedToken);
        if (isTokenValid(tokenData)) {
          return tokenData.access_token;
        }
      }
    }

    // If no valid token, request a new one
    if (!client_id || !client_secret) {
      throw new Error("Zoom account not found");
    }

    // Prepare Basic Auth header
    const authHeader = `Basic ${Buffer.from(
      `${client_id}:${client_secret}`
    ).toString("base64")}`;

    // Prepare request parameters
    const params = new URLSearchParams();
    params.append("grant_type", "account_credentials");
    params.append("account_id", account_id);

    // Make the token request
    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
      body: params,
    });

    // Parse the response
    const data = await response.json();

    // Handle non-200 responses
    if (!response.ok) {
      throw new Error(data.error || "Falha na autenticação");
    }

    // Prepare the token data
    const tokenData: TokenData = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000,
      expires_in: data.expires_in,
      account_id,
      client_id,
    };

    // Update the token cache
    const cache = getClientTokenCache();
    if (!cache[client_id]) {
      cache[client_id] = [];
    }

    // Remove any existing token for the same account_id
    cache[client_id] = cache[client_id].filter(
      (token) => token.account_id !== account_id
    );

    // Add the new token
    cache[client_id].push(tokenData);
    saveClientTokenCache(cache);

    // Also save in old format for compatibility
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
    console.error("Erro na autenticação:");
    if (error instanceof Error) {
      console.error(error);
    }
    throw new Error("error  on Zoom authentication");
  }
}
