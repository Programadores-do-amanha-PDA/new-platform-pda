"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "../logger";

const log = logger.child({ module: "supabase.server" });

export async function createClient() {
    try {
        const cookieStore = await cookies();

        return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        log.error({ err: error, operation: "setCookies" }, "Failed to set cookies in createClient");
                    }
                },
            },
        });
    } catch (error) {
        log.error({ err: error, operation: "createClient" }, "Failed to create Supabase client");
        throw error;
    }
}

export async function createClientAdmin() {
    try {
        const cookieStore = await cookies();

        return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        log.error({ err: error, operation: "setCookies" }, "Failed to set cookies in createClientAdmin");
                    }
                },
            },
        });
    } catch (error) {
        log.error({ err: error, operation: "createClientAdmin" }, "Failed to create Supabase admin client");
        throw error;
    }
}
