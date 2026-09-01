import { NextResponse } from "next/server";

// Temporary diagnostic route — remove once the ByteString/bullet-character
// issue in a push-related env var is found. Reports character codes so we
// can find a corrupted value without relying on screenshot transcription.
export const dynamic = "force-dynamic";

function inspect(value: string | undefined) {
  if (value === undefined) return null;
  return {
    value,
    length: value.length,
    charCodes: [...value].map((c) => c.codePointAt(0)),
  };
}

export async function GET() {
  return NextResponse.json({
    VAPID_SUBJECT: inspect(process.env.VAPID_SUBJECT),
    NEXT_PUBLIC_VAPID_KEY: inspect(process.env.NEXT_PUBLIC_VAPID_KEY),
    VAPID_PRIVATE_KEY_present: !!process.env.VAPID_PRIVATE_KEY,
    VAPID_PRIVATE_KEY_length: process.env.VAPID_PRIVATE_KEY?.length ?? 0,
    CRON_SECRET_present: !!process.env.CRON_SECRET,
  });
}
