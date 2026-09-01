"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadState, updateSettings } from "@/lib/streak";
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";

export default function SettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [morningTime, setMorningTime] = useState("05:30");
  const [eveningTime, setEveningTime] = useState("17:30");
  const [supported, setSupported] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = loadState();
    setEnabled(state.settings.notificationsEnabled);
    setMorningTime(state.settings.reminderMorningTime);
    setEveningTime(state.settings.reminderEveningTime);
    setSupported(isPushSupported());
  }, []);

  async function handleToggle() {
    setMessage(null);
    setPending(true);

    if (!enabled) {
      const ok = await subscribeToPush(morningTime, eveningTime);
      if (ok) {
        setEnabled(true);
        updateSettings({ notificationsEnabled: true });
      } else {
        setMessage("അനുമതി ലഭിച്ചില്ല അല്ലെങ്കിൽ ഇത് ഈ ബ്രൗസറിൽ പിന്തുണയ്ക്കുന്നില്ല.");
      }
    } else {
      await unsubscribeFromPush();
      setEnabled(false);
      updateSettings({ notificationsEnabled: false });
    }

    setPending(false);
  }

  async function handleTimeSave() {
    setPending(true);
    updateSettings({
      reminderMorningTime: morningTime,
      reminderEveningTime: eveningTime,
    });
    if (enabled) {
      await subscribeToPush(morningTime, eveningTime);
    }
    setPending(false);
    setMessage("സേവ് ചെയ്തു");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-8">
      <Link href="/" className="text-sm text-shell-muted/70">
        &larr; ആത്മീയമിത്രം
      </Link>

      <h1 className="mt-4 font-malayalam text-xl font-semibold text-shell-muted">
        ക്രമീകരണങ്ങൾ
      </h1>

      {!supported && (
        <p className="mt-6 text-sm text-shell-muted/70">
          അറിയിപ്പുകൾ ഈ ബ്രൗസറിൽ പിന്തുണയ്ക്കുന്നില്ല. iOS-ൽ, ഹോം സ്ക്രീനിലേക്ക്
          ചേർത്ത ശേഷം മാത്രമേ അറിയിപ്പുകൾ പ്രവർത്തിക്കൂ.
        </p>
      )}

      {supported && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between rounded border border-shell-muted/25 px-4 py-3">
            <span className="text-sm text-shell-muted">ദിനംപ്രതി അറിയിപ്പുകൾ</span>
            <button
              onClick={handleToggle}
              disabled={pending}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                enabled
                  ? "border border-gold text-gold"
                  : "border border-shell-muted/40 text-shell-muted"
              }`}
            >
              {enabled ? "ഓണാണ്" : "ഓഫാണ്"}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="morning" className="text-sm text-shell-muted">
                രാവിലെ സമയം
              </label>
              <input
                id="morning"
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
                className="rounded border border-shell-muted/30 bg-transparent px-2 py-1 text-sm text-shell-muted"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="evening" className="text-sm text-shell-muted">
                വൈകുന്നേരം സമയം
              </label>
              <input
                id="evening"
                type="time"
                value={eveningTime}
                onChange={(e) => setEveningTime(e.target.value)}
                className="rounded border border-shell-muted/30 bg-transparent px-2 py-1 text-sm text-shell-muted"
              />
            </div>
            <button
              onClick={handleTimeSave}
              disabled={pending}
              className="w-full rounded border border-gold py-1.5 text-sm font-medium text-gold disabled:opacity-50"
            >
              സേവ് ചെയ്യുക
            </button>
          </div>

          {message && (
            <p className="text-center text-xs text-shell-muted/70">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
