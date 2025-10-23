import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('next')

  if (token_hash && type) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Success - redirect to the intended destination
      return NextResponse.redirect(redirectTo)
    } else {
      console.error('OTP verification failed:', error)
      // Add error message to redirect URL
      redirectTo.searchParams.set('error', 'verification_failed')
    }
  }

  // Return the user to an error page with instructions
  redirectTo.pathname = '/auth/auth-code-error'
  return NextResponse.redirect(redirectTo)
}