import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logInfo, logError, logWarn } from '@/lib/logger'

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
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  
  logInfo('Auth callback request received', {
    type,
    next,
    hasTokenHash: !!token_hash,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  })
  
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('next')

  if (token_hash && type) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (!error) {
        logInfo('OTP verification successful', { type, redirectTo: next })
        // Success - redirect to the intended destination
        return NextResponse.redirect(redirectTo)
      } else {
        logError('OTP verification failed', error, { type, tokenHashLength: token_hash.length })
        // Add error message to redirect URL
        redirectTo.searchParams.set('error', 'verification_failed')
      }
    } catch (error) {
      logError('Error during OTP verification', error, { type })
      redirectTo.searchParams.set('error', 'verification_error')
    }
  } else {
    logWarn('Auth callback missing required parameters', {
      hasTokenHash: !!token_hash,
      hasType: !!type
    })
  }

  // Return the user to an error page with instructions
  redirectTo.pathname = '/auth/auth-code-error'
  logInfo('Redirecting to error page', { finalRedirect: redirectTo.pathname })
  return NextResponse.redirect(redirectTo)
}