import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/webpush";

function getLocalTime(timezone: string): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  return {
    hour: Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24,
    minute: Number(parts.find((p) => p.type === "minute")?.value ?? "0"),
  };
}

function floorTo15(minute: number) {
  return Math.floor(minute / 15) * 15;
}

function parseTime(t: string) {
  const [hour, minute] = t.split(":").map(Number);
  return { hour, minute };
}

const MESSAGES = {
  morning: {
    title: "ആത്മീയമിത്രം",
    body: "രാവിലെ ദിക്ർ ചൊല്ലാൻ സമയമായി.",
  },
  evening: {
    title: "ആത്മീയമിത്രം",
    body: "വൈകുന്നേരം ദിക്ർ ചൊല്ലാൻ സമയമായി.",
  },
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await handleSend();
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : null,
      },
      { status: 500 },
    );
  }
}

async function handleSend() {
  const supabase = createAdminClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build the due list first, then send everything in parallel — sending
  // sequentially risked exceeding pg_net's HTTP timeout as the subscriber
  // count grows (confirmed happening even with just 3 subscriptions,
  // combined with Vercel cold-start latency).
  const due: { sub: (typeof subscriptions)[number]; period: "morning" | "evening" }[] = [];

  for (const sub of subscriptions ?? []) {
    let local: { hour: number; minute: number };
    try {
      local = getLocalTime(sub.timezone);
    } catch {
      local = getLocalTime("Asia/Riyadh");
    }

    const bucket = floorTo15(local.minute);
    const morning = parseTime(sub.reminder_morning_time);
    const evening = parseTime(sub.reminder_evening_time);

    if (local.hour === morning.hour && floorTo15(morning.minute) === bucket) {
      due.push({ sub, period: "morning" });
    }
    if (local.hour === evening.hour && floorTo15(evening.minute) === bucket) {
      due.push({ sub, period: "evening" });
    }
  }

  const results = await Promise.allSettled(
    due.map(({ sub, period }) =>
      sendPushNotification(sub, { ...MESSAGES[period], url: "/" }),
    ),
  );

  let sent = 0;
  let removed = 0;
  const errors: string[] = [];
  const toRemove = new Set<string>();

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      sent++;
      return;
    }

    const err = result.reason;
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode: number }).statusCode
        : null;

    if (statusCode === 404 || statusCode === 410) {
      toRemove.add(due[i].sub.endpoint);
    } else {
      const detail = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
      errors.push(detail);
    }
  });

  if (toRemove.size > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", [...toRemove]);
    removed = toRemove.size;
  }

  return NextResponse.json({ checked: subscriptions?.length ?? 0, sent, removed, errors });
}
