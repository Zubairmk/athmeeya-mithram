import { NextResponse } from "next/server";

// Temporary diagnostic route — remove once the production env var issue
// is resolved. Only echoes values that are already meant to be public
// (NEXT_PUBLIC_* are shipped to the browser anyway); never add secret
// keys here.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0,
    SUPABASE_SERVICE_ROLE_KEY_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
