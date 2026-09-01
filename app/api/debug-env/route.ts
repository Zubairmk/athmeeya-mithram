import { NextResponse } from "next/server";

// Temporary diagnostic route — remove once the ByteString/bullet-character
// issue in a push-related env var is found. Reports character codes so we
// can find a corrupted value without relying on screenshot transcription.
export const dynamic = "force-dynamic";
// build marker: forcing a fresh build to test whether Redeploy was reusing
// a stale build cache instead of re-reading current env vars

function inspect(value: string | undefined) {
  if (value === undefined) return null;
  const badChars = [...value]
    .map((c, i) => ({ i, code: c.codePointAt(0)! }))
    .filter((c) => c.code > 255);
  return {
    length: value.length,
    badChars, // any char code > 255 — the ByteString-breaking kind
  };
}

export async function GET() {
  return NextResponse.json({
    VAPID_SUBJECT: inspect(process.env.VAPID_SUBJECT),
    NEXT_PUBLIC_VAPID_KEY: inspect(process.env.NEXT_PUBLIC_VAPID_KEY),
    VAPID_PRIVATE_KEY: inspect(process.env.VAPID_PRIVATE_KEY),
    CRON_SECRET: inspect(process.env.CRON_SECRET),
    SUPABASE_SERVICE_ROLE_KEY: inspect(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ANTHROPIC_API_KEY: inspect(process.env.ANTHROPIC_API_KEY),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: inspect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  });
}
