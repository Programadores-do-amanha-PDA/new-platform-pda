"use server";

import { createClient, createClientAdmin } from "./server";

// Cache das instâncias do Supabase
let supabaseClientCache: Awaited<ReturnType<typeof createClient>> | null = null;
let supabaseAdminCache: Awaited<ReturnType<typeof createClientAdmin>> | null = null;

/**
 * Retorna uma instância cached do Supabase client
 * Evita criar múltiplas instâncias desnecessárias
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
 * Retorna uma instância cached do Supabase admin client
 * Evita criar múltiplas instâncias desnecessárias
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
 * Limpa o cache das instâncias (útil para testes ou reset)
 */
export const clearSupabaseCache = () => {
    supabaseClientCache = null;
    supabaseAdminCache = null;
};
