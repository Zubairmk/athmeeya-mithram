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

  const supabase = createAdminClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let removed = 0;
  const errors: string[] = [];

  for (const sub of subscriptions ?? []) {
    let timezone = sub.timezone;
    let local: { hour: number; minute: number };
    try {
      local = getLocalTime(timezone);
    } catch {
      timezone = "Asia/Riyadh";
      local = getLocalTime(timezone);
    }

    const bucket = floorTo15(local.minute);
    const morning = parseTime(sub.reminder_morning_time);
    const evening = parseTime(sub.reminder_evening_time);

    const periods: ("morning" | "evening")[] = [];
    if (local.hour === morning.hour && floorTo15(morning.minute) === bucket) {
      periods.push("morning");
    }
    if (local.hour === evening.hour && floorTo15(evening.minute) === bucket) {
      periods.push("evening");
    }

    for (const period of periods) {
      try {
        await sendPushNotification(sub, {
          ...MESSAGES[period],
          url: "/",
        });
        sent++;
      } catch (err: unknown) {
        const statusCode =
          typeof err === "object" && err !== null && "statusCode" in err
            ? (err as { statusCode: number }).statusCode
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
          removed++;
        } else {
          errors.push(err instanceof Error ? err.message : String(err));
        }
      }
    }
  }

  return NextResponse.json({ checked: subscriptions?.length ?? 0, sent, removed, errors });
}
