"use client";

import { useEffect, useState } from "react";
import { loadState, updateSettings } from "@/lib/streak";
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";
import Header from "@/components/Header";

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

    try {
      if (!enabled) {
        const ok = await subscribeToPush(morningTime, eveningTime, setMessage);
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
    } catch (err) {
      setMessage(
        `പിശക്: ${err instanceof Error ? err.message : "എന്തോ പിഴച്ചു"}`,
      );
    } finally {
      setPending(false);
    }
  }

  async function handleTimeSave() {
    setPending(true);
    updateSettings({
      reminderMorningTime: morningTime,
      reminderEveningTime: eveningTime,
    });

    try {
      if (enabled) {
        await subscribeToPush(morningTime, eveningTime, setMessage);
      }
      setMessage("സേവ് ചെയ്തു");
    } catch (err) {
      setMessage(
        `പിശക്: ${err instanceof Error ? err.message : "എന്തോ പിഴച്ചു"}`,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="pb-28">
      <Header back={{ href: "/", label: "ഹോം" }} />

      <div className="mx-auto max-w-2xl px-6 pb-8 pt-6">
        <h1 className="font-malayalam text-lg font-bold text-ink">
          ക്രമീകരണങ്ങൾ
        </h1>
        <div className="mt-2 h-0.5 w-7 rounded bg-gold" />

        {!supported && (
          <p className="mt-6 text-sm text-ink-muted">
            അറിയിപ്പുകൾ ഈ ബ്രൗസറിൽ പിന്തുണയ്ക്കുന്നില്ല. iOS-ൽ, ഹോം സ്ക്രീനിലേക്ക്
            ചേർത്ത ശേഷം മാത്രമേ അറിയിപ്പുകൾ പ്രവർത്തിക്കൂ.
          </p>
        )}

        {supported && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
              <span className="text-sm text-ink">ദിനംപ്രതി അറിയിപ്പുകൾ</span>
              <button
                onClick={handleToggle}
                disabled={pending}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  enabled
                    ? "border border-green bg-green text-white"
                    : "border border-line text-ink-muted"
                }`}
              >
                {enabled ? "ഓണാണ്" : "ഓഫാണ്"}
              </button>
            </div>

            <div className="rounded-xl border border-line px-4 py-3">
              <div className="flex items-center justify-between">
                <label htmlFor="morning" className="text-sm text-ink">
                  രാവിലെ സമയം
                </label>
                <input
                  id="morning"
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="rounded-lg border border-line bg-transparent px-2 py-1 text-sm text-ink"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label htmlFor="evening" className="text-sm text-ink">
                  വൈകുന്നേരം സമയം
                </label>
                <input
                  id="evening"
                  type="time"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                  className="rounded-lg border border-line bg-transparent px-2 py-1 text-sm text-ink"
                />
              </div>
            </div>

            <button
              onClick={handleTimeSave}
              disabled={pending}
              className="w-full rounded-lg border border-green bg-green py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              സേവ് ചെയ്യുക
            </button>

            {message && (
              <p className="text-center text-xs text-ink-muted">{message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
