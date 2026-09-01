import webpush from "web-push";

let configured = false;

// Deferred until actual send time (not module load): Next.js's build step
// executes route modules to collect page metadata, and eager
// setVapidDetails() validation there crashed the whole build if the VAPID
// env vars weren't visible at that build step.
function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPushNotification(
  sub: PushSubscriptionRow,
  payload: { title: string; body: string; url?: string },
) {
  ensureConfigured();
  return webpush.sendNotification(
    {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    },
    JSON.stringify(payload),
  );
}

export { webpush };
