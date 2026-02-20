"use server";
import { Buffer } from "buffer";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { ZoomAccountT } from "../types/accounts";
import { TokenData, ClientTokenCache } from "../types/api";

const log = logger.child({ module: "oauth" });

function isTokenValid(tokenData: TokenData): boolean {
    // Consider a small buffer time to account for delays
    const BUFFER_TIME = 300000;

    if (!tokenData || !tokenData.expires_at) return false;

    const isTokenExpired = tokenData.expires_at < Date.now() + BUFFER_TIME;
    if (isTokenExpired) return false;

    return true;
}

async function getClientTokenCacheAsync(): Promise<ClientTokenCache> {
    try {
        const cookieStore = cookies();

        // Retrieve the token cache
        const cacheData = (await cookieStore).get("zoom_client_token_cache")?.value;

        if (!cacheData) {
            return {};
        }

        return JSON.parse(cacheData);
    } catch {
        return {};
    }
}

async function saveClientTokenCacheAsync(cache: ClientTokenCache): Promise<void> {
    const cookieStore = cookies();

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
    (await cookieStore).set({
        name: "zoom_client_token_cache",
        value: JSON.stringify(cleanCache),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: "/",
    });
}

async function findValidTokenByClientIdAsync(client_id: string, account_id: string): Promise<TokenData | null> {
    if (!client_id || !account_id) return null;

    const cache = await getClientTokenCacheAsync();

    const clientTokens = cache[client_id] || [];

    // Find a valid token for the specific account_id
    const validToken = clientTokens.find((token) => token.account_id === account_id && isTokenValid(token)) || null;

    return validToken;
}

export async function clearTokenCacheAsync(account_id: string, client_id?: string): Promise<void> {
    const cookieStore = cookies();

    // remove old cache based on account_id for compatibility
    (await cookieStore).delete(`zoom_access_token_key_${account_id}`);

    if (client_id) {
        // remove from new cache based on client_id
        const cache = await getClientTokenCacheAsync();
        if (cache[client_id]) {
            // Remove tokens for the specific account_id
            cache[client_id] = cache[client_id].filter((token) => token.account_id !== account_id);
            // If no tokens left for this client_id, remove the client_id entry
            if (cache[client_id].length === 0) {
                delete cache[client_id];
            }
            // Save the updated cache
            saveClientTokenCacheAsync(cache);
        }
    }
}

export async function clearAllTokensForClientAsync(client_id: string): Promise<void> {
    const cache = await getClientTokenCacheAsync();
    if (cache[client_id]) {
        delete cache[client_id];
        saveClientTokenCacheAsync(cache);
    }
}

export async function getAccessToken(
    { account_id, client_id, client_secret }: Pick<ZoomAccountT, "account_id" | "client_id" | "client_secret">,
    forceRefresh: boolean = false,
): Promise<string> {
    try {
        const cookieStore = cookies();

        if (!forceRefresh && client_id) {
            const cachedToken = await findValidTokenByClientIdAsync(client_id, account_id);
            if (cachedToken) {
                return cachedToken.access_token;
            }

            const storedToken = (await cookieStore).get(`zoom_access_token_key_${account_id}`)?.value;

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

        const authHeader = `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`;
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

        const cache = await getClientTokenCacheAsync();
        if (!cache[client_id]) {
            cache[client_id] = [];
        }

        // Remove any existing token for the same account_id
        cache[client_id] = cache[client_id].filter((token) => token.account_id !== account_id);

        cache[client_id].push(tokenData);
        saveClientTokenCacheAsync(cache);

        // Also save in old format for compatibility
        (await cookieStore).set({
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
        log.error({ err: error }, "Error on oauth getting access token");
        throw new Error("Error on Zoom authentication", { cause: error });
    }
}
