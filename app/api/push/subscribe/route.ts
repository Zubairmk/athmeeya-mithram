import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    endpoint,
    keys,
    reminder_morning_time,
    reminder_evening_time,
    timezone,
  } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json(
      { error: "endpoint and keys.p256dh/keys.auth are required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const optionalFields = {
    ...(reminder_morning_time && { reminder_morning_time }),
    ...(reminder_evening_time && { reminder_evening_time }),
    ...(timezone && { timezone }),
  };

  // Plain insert, falling back to update on conflict — not .upsert(), since
  // Postgres's ON CONFLICT DO UPDATE needs SELECT visibility on the existing
  // row to resolve the conflict, and this table deliberately has no public
  // SELECT policy (endpoints shouldn't be publicly enumerable). Insert and
  // update independently both work fine under RLS.
  const { error: insertError } = await supabase.from("push_subscriptions").insert({
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    ...optionalFields,
  });

  if (insertError) {
    if (insertError.code !== "23505") {
      // not a unique-violation (endpoint already exists) — real error
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("push_subscriptions")
      .update({ p256dh: keys.p256dh, auth: keys.auth, ...optionalFields })
      .eq("endpoint", endpoint);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const { endpoint } = await request.json();
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
