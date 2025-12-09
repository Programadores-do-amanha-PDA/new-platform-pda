import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "route.auth.callback" });

/**
 * API Route for handling authentication callbacks
 *
 * This route handles OTP verification from email links and redirects users appropriately.
 * It follows the new Supabase authentication pattern using token_hash and type parameters.
 *
 * @example
 * URL: /api/auth/callback?token_hash=abc123&type=recovery&next=/dashboard
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/dashboard";

    log.info(
        {
            type,
            next,
            hasTokenHash: !!token_hash,
            userAgent: request.headers.get("user-agent"),
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        },
        "Auth callback request received",
    );

    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = next;
    redirectTo.searchParams.delete("token_hash");
    redirectTo.searchParams.delete("type");
    redirectTo.searchParams.delete("next");

    if (token_hash && type) {
        const supabase = await createClient();

        try {
            const { error } = await supabase.auth.verifyOtp({
                type,
                token_hash,
            });

            if (!error) {
                log.info({ type, redirectTo: next }, "OTP verification successful");
                // Success - redirect to the intended destination
                return NextResponse.redirect(redirectTo);
            } else {
                log.error({ err: error, type, tokenHashLength: token_hash.length }, "OTP verification failed");
                // Add error message to redirect URL
                redirectTo.searchParams.set("error", "verification_failed");
            }
        } catch (error) {
            log.error({ err: error, type }, "Error during OTP verification");
            redirectTo.searchParams.set("error", "verification_error");
        }
    } else {
        log.warn(
            {
                hasTokenHash: !!token_hash,
                hasType: !!type,
            },
            "Auth callback missing required parameters",
        );
    }

    // Return the user to an error page with instructions
    redirectTo.pathname = "/auth/auth-code-error";
    log.info({ finalRedirect: redirectTo.pathname }, "Redirecting to error page");
    return NextResponse.redirect(redirectTo);
}
