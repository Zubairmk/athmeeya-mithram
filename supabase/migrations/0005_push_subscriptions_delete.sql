-- Allow a device to remove its own push subscription (disabling
-- notifications). Anyone can technically delete by endpoint since
-- there's no device identity beyond the endpoint itself — acceptable
-- for this anonymous, no-login model.

create policy "anyone can delete a subscription by endpoint"
  on push_subscriptions for delete
  to anon, authenticated
  using (true);
