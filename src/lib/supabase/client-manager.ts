"use server";

import { createClient, createClientAdmin } from "./server";

let supabaseClientCache: Awaited<ReturnType<typeof createClient>> | null = null;
let supabaseAdminCache: Awaited<ReturnType<typeof createClientAdmin>> | null = null;

/**
 * Returns a cached instance of the Supabase client
 * Prevents creating multiple unnecessary instances
 * @returns {Promise<Awaited<ReturnType<typeof createClient>>>} Supabase client instance
 */
export const getSupabaseClient = async () => {
    try {
        if (!supabaseClientCache) {
            supabaseClientCache = await createClient();
        }
        return supabaseClientCache;
    } catch (error) {
        throw error;
    }
};

/**
 * Returns a cached instance of the Supabase admin client
 * Prevents creating multiple unnecessary instances
 * @returns {Promise<Awaited<ReturnType<typeof createClientAdmin>>>} Supabase admin client instance
 */
export const getSupabaseAdminClient = async () => {
    try {
        if (!supabaseAdminCache) {
            supabaseAdminCache = await createClientAdmin();
        }
        return supabaseAdminCache;
    } catch (error) {
        throw error;
    }
};

/**
 * Clears the cached Supabase client instances
 * Useful for testing or resetting state
 * @returns {Promise<void>}
 */
export const clearSupabaseCache = async () => {
    supabaseClientCache = null;
    supabaseAdminCache = null;
};
