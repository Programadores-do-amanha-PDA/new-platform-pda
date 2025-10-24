import { createBrowserClient } from "@supabase/ssr";

export default function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        detectSessionInUrl: false, // We handle URL detection manually
        flowType: "implicit",
      },
    }
  );
}
