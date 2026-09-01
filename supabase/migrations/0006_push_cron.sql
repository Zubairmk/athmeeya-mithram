-- Schedules the push-reminder check every 15 minutes via pg_cron + pg_net,
-- calling this app's /api/push/send route directly from Postgres. This
-- replaces a standalone Supabase Edge Function — same practical effect
-- (a periodic trigger hitting the send logic), without needing the
-- Supabase CLI/Deno tooling to deploy one.
--
-- IMPORTANT: do not commit this file with real values filled in below —
-- <YOUR_DEPLOYED_URL> and <YOUR_CRON_SECRET> are placeholders. Fill them
-- in only in the SQL editor when you run this, using the CRON_SECRET
-- value from your .env.local / Vercel env vars.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'push-reminder-check',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := '<YOUR_DEPLOYED_URL>/api/push/send',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <YOUR_CRON_SECRET>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);

-- To inspect scheduled jobs:      select * from cron.job;
-- To see run history:            select * from cron.job_run_details order by start_time desc limit 20;
-- To remove the schedule:        select cron.unschedule('push-reminder-check');
